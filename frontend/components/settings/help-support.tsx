"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Phone } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface HelpSupportProps {
  onBack: () => void
}

export function HelpSupport({ onBack }: HelpSupportProps) {
  const faqs = [
    {
      question: "How do I create a new chat?",
      answer: "Click on the 'New chat' button in the sidebar to start a new conversation with the AI assistant.",
    },
    {
      question: "Can I use voice commands?",
      answer:
        "Yes, click on the microphone icon at the bottom of the chat to start voice recognition. Speak clearly and the AI will respond to your voice commands.",
    },
    {
      question: "How do I change my password?",
      answer: "Go to Settings > Change Password to update your account password.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, all conversations are encrypted and we follow strict data protection protocols to ensure your information remains private and secure.",
    },
    {
      question: "How can I delete my account?",
      answer:
        "Contact our support team to request account deletion. All your data will be permanently removed from our systems.",
    },
  ]

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4">
      <Card className="w-full max-w-3xl mx-auto p-6 shadow-lg rounded-xl space-y-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle className="text-2xl">Help & Support</CardTitle>
              <CardDescription className="text-lg">
                Get assistance and find answers to common questions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
  
        <CardContent className="space-y-10">
          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Contact Us</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-start text-left w-full">
                <Mail className="mb-2 h-6 w-6" />
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">support@example.com</p>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-start text-left w-full">
                <Phone className="mb-2 h-6 w-6" />
                <p className="font-medium">Phone Support</p>
                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </Button>
            </div>
          </div>
  
          {/* FAQ Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible className="w-full space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-lg font-medium">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 