import { Chat, User } from './types';

export const systemUser: User = {
  id: 'system',
  name: 'Vacei Support',
  role: 'PLATFORM_ADMIN',
  isOnline: true,
};

export const clientUser: User = {
  id: 'me',
  name: 'Client User',
  role: 'CLIENT',
  isOnline: true,
};

export const serviceAdvisors: Record<string, User> = {
  accounting: { id: 'adv1', name: 'James Miller (Senior Accountant)', role: 'ORG_ADMIN', isOnline: true },
  vat: { id: 'adv2', name: 'Elena Rossi (Tax Specialist)', role: 'ORG_EMPLOYEE', isOnline: true },
  payroll: { id: 'adv3', name: 'David Smith (Payroll Lead)', role: 'ORG_EMPLOYEE', isOnline: false, lastSeen: '2 HOURS AGO' },
  legal: { id: 'adv4', name: 'Maria Borg (Legal Advisor)', role: 'ORG_ADMIN', isOnline: true },
};

export const getMockChatForService = (serviceSlug: string, serviceName: string): Chat => {
  const advisor = serviceAdvisors[serviceSlug] || serviceAdvisors.accounting;
  
  const messagesMap: Record<string, any[]> = {
    bookkeeping: [
      { id: 'm1', senderId: advisor.id, text: `Hello! I'm James, your dedicated accountant for ${serviceName}.`, timestamp: '10:00 AM', status: 'read', type: 'text' },
      { id: 'm2', senderId: 'me', text: 'Hi James, thanks for the intro. When will the January reports be ready?', timestamp: '10:05 AM', status: 'read', type: 'text' },
      { id: 'm3', senderId: advisor.id, text: "I'm currently finalizing the bank reconciliations. You should see the reports in your dashboard by Friday.", timestamp: '10:10 AM', status: 'read', type: 'text' },
      { id: 'm4', senderId: advisor.id, text: "Btw, I noticed a missing receipt for the 'Office Supplies' transaction on the 15th. Could you upload that?", timestamp: '10:11 AM', status: 'read', type: 'text' },
    ],
    vat: [
      { id: 'm1', senderId: advisor.id, text: `Hi there, I'm Elena. I'll be handling your ${serviceName} filings for this quarter.`, timestamp: '09:30 AM', status: 'read', type: 'text' },
      { id: 'm2', senderId: advisor.id, text: "I've reviewed your uploaded invoices. Everything looks good for the Q1 submission.", timestamp: '09:31 AM', status: 'read', type: 'text' },
      { id: 'm3', senderId: 'me', text: 'Great news. Do I need to sign anything?', timestamp: '09:45 AM', status: 'read', type: 'text' },
      { id: 'm4', senderId: advisor.id, text: "Yes, I'll send the authorization form shortly. You can sign it digitally through the portal.", timestamp: '10:00 AM', status: 'read', type: 'text' },
    ],
    payroll: [
      { id: 'm1', senderId: advisor.id, text: "Hi, this is David from the payroll team. We've received the new employee details.", timestamp: 'YESTERDAY', status: 'read', type: 'text' },
      { id: 'm2', senderId: advisor.id, text: "Will they be starting on the 1st or the 15th of next month?", timestamp: 'YESTERDAY', status: 'read', type: 'text' },
      { id: 'm3', senderId: 'me', text: 'They start on the 1st. I just uploaded their contracts.', timestamp: 'YESTERDAY', status: 'read', type: 'text' },
      { id: 'm4', senderId: advisor.id, text: 'Perfect. I will include them in the next payroll run.', timestamp: '9:00 AM', status: 'delivered', type: 'text' },
    ]
  };

  const messages = messagesMap[serviceSlug] || [
    { id: 'm1', senderId: advisor.id, text: `Welcome to your ${serviceName} engagement chat.`, timestamp: '10:00 AM', status: 'read', type: 'text' },
    { id: 'm2', senderId: advisor.id, text: "Our team will use this channel for all service-related updates and queries.", timestamp: '10:01 AM', status: 'read', type: 'text' },
  ];

  return {
    id: `chat-${serviceSlug}`,
    type: 'GROUP',
    name: `${serviceName} Support`,
    participants: [advisor, clientUser],
    unreadCount: 0,
    messages: messages,
    lastMessage: messages[messages.length - 1],
  };
};
