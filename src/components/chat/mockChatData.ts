
export const MOCK_CHAT_DATA = {
    assignments: [
        {
            assignmentId: 101,
            accountant: {
                id: 101,
                first_name: "Sarah",
                last_name: "Jones",
                email: "sarah.jones@vacei.com",
                name: "Sarah Jones",
            },
        },
        {
            assignmentId: 102,
            accountant: {
                id: 102,
                first_name: "Michael",
                last_name: "Smith",
                email: "michael.smith@vacei.com",
                name: "Michael Smith",
            },
        },
        {
            assignmentId: 103,
            accountant: {
                id: 103,
                first_name: "Emma",
                last_name: "Wilson",
                email: "emma.wilson@vacei.com",
                name: "Emma Wilson",
            },
        }
    ],
    messages: {
        101: [
            {
                id: "msg_1",
                senderId: 101,
                message: "Hello! I've started reviewing your VAT return for Q4.",
                createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
            },
            {
                id: "msg_2",
                senderId: "current_user", // This will be mapped to actual userId
                message: "Great, let me know if you need any additional documents.",
                createdAt: new Date(Date.now() - 3600000 * 23).toISOString(),
            },
            {
                id: "msg_3",
                senderId: 101,
                message: "I will. Most of the invoices are there, just missing the utility bill for December.",
                createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
            }
        ],
        102: [
            {
                id: "msg_4",
                senderId: 102,
                message: "Hi there, could you please confirm the payroll details for the new employee?",
                createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            }
        ],
        103: [
            {
                id: "msg_5",
                senderId: 103,
                message: "The audit engagement letter has been sent to your dashboard. Please sign it at your earliest convenience.",
                createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
            }
        ]
    }
};
