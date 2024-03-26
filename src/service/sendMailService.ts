import sqs from "../config/awsSQS";
import nodemailer from 'nodemailer';
import type { EmailJob } from "../models/emailJob";

interface sistemas {GTF: string; SMEDS: string; ABRANGE: string;}

const transporter = nodemailer.createTransport({
    pool: true,
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  
  const sendEmailFromQueue = async (email: EmailJob) => {

    let emailAdressAlias = process.env.EMAIL_ADDRESS;

    const sistemas: sistemas = {
      GTF: "@sistemagtf.com.br",
      SMEDS: "@smeds.com.br",
      ABRANGE: "@abrange.app"
    }

    if(email.sistema){
      emailAdressAlias = 'informativo' + sistemas[email.sistema as keyof sistemas]
    }   

    const mailOptions = {
      from: emailAdressAlias,
      to: email.to,
      cc: email.cc,
      bcc: email.bcc,
      subject: email.subject,
      text: email.text,
      html: email.html,
      style: email.style
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };
  
  const receiveMessagesFromQueue = async () => {
    const receiveParams = {
      QueueUrl: process.env.AWS_QUEUE_URL!,
      VisibilityTimeout: 30,
    };
  
    try {
      const data = await sqs.receiveMessage(receiveParams).promise(); 
      
      console.log(data.Messages);

      if (data.Messages!.length > 0) {
        data.Messages!.forEach(async (message) => {
          if(message.Body && message.Body != "null"){
            const emailData = JSON.parse(message.Body);
  
            await sendEmailFromQueue(emailData);
    
            const deleteParams = {
              QueueUrl: process.env.AWS_QUEUE_URL!,
              ReceiptHandle: message.ReceiptHandle!,
            };
    
            await sqs.deleteMessage(deleteParams).promise();
          }          
        });
      } else {
        console.log('Não há mensagens na fila para processar.');
      }
    } catch (error) {
      console.error('Error receiving messages from queue:', error);
    }
  };
  
  setInterval(receiveMessagesFromQueue, 3000);