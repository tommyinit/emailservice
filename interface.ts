export interface EmailData {
    from: string,
    to: string,
    cc?: string,
    bcc?: string,
    subject: string,
    text: string
}