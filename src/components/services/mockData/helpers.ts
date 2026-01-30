export const MOCK_TEAM = [
  {
    id: '1',
    name: 'Sarah Jennings',
    role: 'Engagement Partner',
    email: 'sarah.j@vacei.com',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    active: true
  },
  {
    id: '2',
    name: 'Mark Thompson',
    role: 'Senior Manager',
    email: 'mark.t@vacei.com',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    active: true
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    role: 'Associate',
    email: 'elena.r@vacei.com',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    active: false
  }
];

export const MOCK_MESSAGES = [
  {
    id: '1',
    senderId: 'sarah_j',
    senderName: 'Sarah Jennings',
    senderRole: 'Partner',
    content: "I've reviewed the preliminary data and noticed some missing invoices for March. Could you please check the document requests tab?",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    type: 'message'
  },
  {
    id: '2',
    senderId: 'mark_t',
    senderName: 'Mark Thompson',
    senderRole: 'Manager',
    content: "The draft VAT return is now available for your review in the 'Periods' tab.",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    read: true,
    type: 'notification'
  }
];
