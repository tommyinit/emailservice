# Simple email service

Install and start
```
 npm install
 npm run build
 npm run start
```

## Run
    - Open browser
    - Type "http://localhost:8080" on browser
    - Input fields and send email

## Introduction
This is a simple email service which generate a email form for user to send email via backend email services.

There are two email service provider configured at backend for sending emails:

    - MailGun email service
    - SendGrid email service

MailGun email service was working during development. It is no longer sending emails maybe because of the free account with sandbox domain configuration. 
It should failover to SendGrid email services to email anyway.

## Input validation

- There are few simple input validations at backend using Joi library.
