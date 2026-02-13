import type { Chat, User } from './types';

export const users: User[] = [
  {
    id: 'support1',
    name: 'Sarah Wilson',
    role: 'PLATFORM_ADMIN', // Keeping original role types but treating as support lead
    isOnline: true,
  },
  {
    id: 'accountant1',
    name: 'John Miller',
    role: 'PLATFORM_EMPLOYEE',
    isOnline: false,
    lastSeen: '2 minutes ago',
  },
  {
    id: 'auditor1',
    name: 'Michael Chen',
    role: 'PLATFORM_ADMIN',
    isOnline: true,
  },
  {
    id: 'support2',
    name: 'Emma Thompson',
    role: 'PLATFORM_EMPLOYEE',
    isOnline: true,
  },
  {
    id: 'compliance1',
    name: 'David Rodriguez',
    role: 'PLATFORM_ADMIN',
    isOnline: true,
  },
  {
    id: 'tax_expert1',
    name: 'Sophia Lee',
    role: 'PLATFORM_EMPLOYEE',
    isOnline: false,
    lastSeen: '1 hour ago',
  },
  {
    id: 'client_rep1',
    name: 'Alex Rivers',
    role: 'PLATFORM_ADMIN',
    isOnline: false,
    lastSeen: 'Yesterday',
  },
];

export const mockChats: Chat[] = [
  {
    id: '1',
    type: 'INDIVIDUAL',
    name: 'Sarah Wilson (Support Lead)',
    participants: [users[0]],
    unreadCount: 2,
    isPinned: true,
    messages: [
      { id: 'm1', senderId: 'support1', text: 'Hey, did you review the new service request details?', timestamp: '10:30 AM', status: 'read' },
      { id: 'm2', senderId: 'me', text: 'Working on it now. Should be done in 10 mins.', timestamp: '10:32 AM', status: 'delivered' },
      { id: 'm3', senderId: 'support1', text: 'Great, thanks! We need it for the upcoming audit.', timestamp: '10:33 AM', status: 'read' },
      { id: 'm4', senderId: 'me', text: 'Understood. Is there anything specific documentation required?', timestamp: '10:35 AM', status: 'read' },
      { id: 'm5', senderId: 'support1', text: 'Just the standard compliance check and the risk assessment files.', timestamp: '10:36 AM', status: 'read' },
      { id: 'm6', senderId: 'support1', text: 'Also, can you check if the document upload is complete?', timestamp: '10:37 AM', status: 'read' },
    ],
    lastMessage: { id: 'm6', senderId: 'support1', text: 'Also, can you check if the document upload is complete?', timestamp: '10:37 AM', status: 'read' },
  },
  {
    id: '5',
    type: 'INDIVIDUAL',
    name: 'David Rodriguez (Compliance)',
    participants: [users[4]],
    unreadCount: 0,
    isPinned: true,
    messages: [
      { id: 'dm1', senderId: 'compliance1', text: 'The annual compliance report is ready for your signature.', timestamp: '08:45 AM', status: 'read' },
      { id: 'dm2', senderId: 'me', text: 'Excellent! I will review and sign it by EOD.', timestamp: '08:50 AM', status: 'read' },
      { id: 'dm3', senderId: 'compliance1', text: 'Everything looks solid this year. No major findings.', timestamp: '09:00 AM', status: 'read' },
      { id: 'dm4', senderId: 'me', text: 'Perfect. Thanks for the thorough work, David.', timestamp: '09:05 AM', status: 'read' },
      { id: 'dm5', senderId: 'compliance1', text: 'Wait, I just noticed one missing document for the offshore entity.', timestamp: '09:15 AM', status: 'read' },
      { id: 'dm6', senderId: 'compliance1', text: 'Checking the vault now. Might have been misfiled.', timestamp: '09:16 AM', status: 'read' },
      { id: 'dm7', senderId: 'me', text: 'Keep me posted on that one.', timestamp: '09:20 AM', status: 'read' },
      { id: 'dm8', senderId: 'compliance1', text: 'Found it! It was in the archive folder. All set now!', timestamp: '09:30 AM', status: 'read' },
    ],
    lastMessage: { id: 'dm8', senderId: 'compliance1', text: 'Found it! It was in the archive folder. All set now!', timestamp: '09:30 AM', status: 'read' },
  },
  {
    id: '2',
    type: 'GROUP',
    name: 'Audit Team 2024',
    participants: [users[0], users[2], users[4]],
    unreadCount: 5,
    messages: [
      { id: 'gm1', senderId: 'support1', text: 'Morning everyone! Audit kickoff meeting starts in 5 minutes.', timestamp: '09:00 AM', status: 'read' },
      { id: 'gm2', senderId: 'auditor1', text: 'I might be 2 mins late, just finishing a call with the regulator.', timestamp: '09:02 AM', status: 'read' },
      { id: 'gm3', senderId: 'support1', text: 'No problem, Michael.', timestamp: '09:03 AM', status: 'read' },
      { id: 'gm4', senderId: 'compliance1', text: 'I am in. Ready to present the compliance overview.', timestamp: '09:05 AM', status: 'read' },
      { id: 'gm5', senderId: 'support1', text: 'First item: Scope of this year\'s financial audit.', timestamp: '09:10 AM', status: 'read' },
      { id: 'gm6', senderId: 'auditor1', text: 'We will be looking closely at the foreign transactions this time.', timestamp: '09:15 AM', status: 'read' },
      { id: 'gm7', senderId: 'support1', text: 'Noted. Let\'s ensure all supporting docs are in the data room.', timestamp: '09:20 AM', status: 'read' },
    ],
    lastMessage: { id: 'gm7', senderId: 'support1', text: 'Noted. Let\'s ensure all supporting docs are in the data room.', timestamp: '09:20 AM', status: 'read' },
  },
  {
    id: '3',
    type: 'INDIVIDUAL',
    name: 'John Miller (Accountant)',
    participants: [users[1]],
    unreadCount: 0,
    messages: [
      { id: 'jm1', senderId: 'accountant1', text: 'Could you provide the bank statements for March?', timestamp: 'Yesterday', status: 'read' },
      { id: 'jm2', senderId: 'me', text: 'Sure, I will upload them to the portal now.', timestamp: 'Yesterday', status: 'read' },
      { id: 'jm3', senderId: 'accountant1', text: 'Thanks! I need them for the monthly reconciliation.', timestamp: 'Yesterday', status: 'read' },
      { id: 'jm4', senderId: 'me', text: 'Done. Let me know if you need anything else.', timestamp: 'Yesterday', status: 'read' },
      { id: 'jm5', senderId: 'accountant1', text: 'Got them. Everything checks out!', timestamp: '08:00 AM', status: 'read' },
    ],
    lastMessage: { id: 'jm5', senderId: 'accountant1', text: 'Got them. Everything checks out!', timestamp: '08:00 AM', status: 'read' },
  },
  {
    id: '6',
    type: 'GROUP',
    name: 'Tax Planning Support',
    participants: [users[1], users[3], users[5]],
    unreadCount: 0,
    messages: [
      { id: 'am1', senderId: 'tax_expert1', text: 'Just uploaded the tax strategy draft.', timestamp: '11:20 AM', status: 'read' },
      { id: 'am2', senderId: 'tax_expert1', type: 'image', fileUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=800&q=80', fileName: 'tax_strategy_2024.png', timestamp: '11:21 AM', status: 'read' },
      { id: 'am3', senderId: 'me', text: 'The projection for Q4 looks very favorable.', timestamp: '11:25 AM', status: 'read' },
      { id: 'am4', senderId: 'support2', text: 'Agreed. The new legislation impact is well-covered.', timestamp: '11:30 AM', status: 'read' },
      { id: 'am5', senderId: 'tax_expert1', text: 'Excellent! I will finalize the report this afternoon.', timestamp: '11:45 AM', status: 'read' },
    ],
    lastMessage: { id: 'am5', senderId: 'tax_expert1', text: 'Excellent! I will finalize the report this afternoon.', timestamp: '11:45 AM', status: 'read' },
  },
];

export const supportChat: Chat = {
  id: 'support-group',
  type: 'GROUP',
  name: 'VACEI Support',
  participants: [users[0], users[3], users[5]],
  unreadCount: 0,
  messages: [
    { id: 's1', senderId: 'support1', text: 'Welcome to VACEI Support! How can we help you today?', timestamp: '09:00 AM', status: 'read' },
    { id: 's2', senderId: 'me', text: 'I have a question about my annual filing.', timestamp: '09:05 AM', status: 'read' },
    { id: 's3', senderId: 'support1', text: 'Of course! Please share your company name and the specific filing period.', timestamp: '09:06 AM', status: 'read' },
  ],
  lastMessage: { id: 's3', senderId: 'support1', text: 'Of course! Please share your company name and the specific filing period.', timestamp: '09:06 AM', status: 'read' },
};
