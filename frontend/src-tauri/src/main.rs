use std::process::{Command, Stdio, Child};
use std::io::{BufRead, BufReader};
use std::sync::{Arc, Mutex};
use tauri::Manager;

fn start_python_server() -> (Option<u16>, Child) {
    let mut child = Command::new("bin/zoroServer") // Use the bundled executable
        .stdout(Stdio::piped()) // Capture output
        .stderr(Stdio::piped()) // Capture errors for debugging
        .spawn()
        .expect("Failed to start Python server");

    let stdout = child.stdout.take().unwrap();
    let reader = BufReader::new(stdout);

    let mut port: Option<u16> = None;

    for line in reader.lines().flatten() {
        if line.contains("Server starting on port") {
            if let Some(p) = line.split_whitespace().last().and_then(|p| p.parse().ok()) {
                println!("Python server started on port: {}", p);
                port = Some(p);
                break; // Stop reading once port is found
            }
        }
    }

    (port, child)
}

fn main() {
    let (python_port, python_server) = start_python_server();
    let python_port = python_port.unwrap_or(3001); // Default to 3001 if detection fails

    let python_server = Arc::new(Mutex::new(Some(python_server)));

    tauri::Builder::default()
        .setup(move |app| {
            let window = app.get_webview_window("main").unwrap();
            window.eval(&format!("window.PYTHON_SERVER_PORT = {};", python_port)).unwrap();
            Ok(())
        })
        .on_window_event({
            let python_server = Arc::clone(&python_server);
            move |_app, event| {
                if let tauri::WindowEvent::CloseRequested { .. } = event {
                    if let Ok(mut server) = python_server.lock() {
                        if let Some(mut child) = server.take() { // ✅ Make `child` mutable
                            let _ = child.kill(); // Kill Python server when app closes
                            println!("Python server stopped.");
                        }
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
