import * as React from "react";

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={`rounded-lg border p-4 shadow-sm ${className || ""}`}>{children}</div>;
};

const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`mb-2 ${className || ""}`}>{children}</div>
);

const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-lg font-semibold ${className || ""}`}>{children}</h2>
);

const CardDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-500 ${className || ""}`}>{children}</p>
);

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`py-2 ${className || ""}`}>{children}</div>
);

const CardFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`mt-4 border-t pt-2 ${className || ""}`}>{children}</div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };