import * as yup from 'yup';

export interface EmailJob {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    text: string;
    sistema: string;
    style: string;
    html: string;    
}

export const emailSchema = yup.object().shape({
    to: yup.array().of(yup.string().email()).required(),
    cc: yup.array().of(yup.string().email()),
    bcc: yup.array().of(yup.string().email()),
    subject: yup.string().required(),
    text: yup.string().required(),
    sistema: yup.string().required(),
    style: yup.string().required(),
    html: yup.string().required(),
});