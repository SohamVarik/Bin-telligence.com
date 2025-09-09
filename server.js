const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Hardcoded user credentials for demo
const validUsername = 'user1';
const validPassword = 'password123';

// Sample waste collection data for September 2-9, 2025
const collectionData = [
    { date: '9 Sep 2025', day: 'Tuesday', organic: 0.8, recyclable: 0.6, hazardous: 0.1 },
    { date: '8 Sep 2025', day: 'Monday', organic: 1.2, recyclable: 0.4, hazardous: 0.1 },
    { date: '7 Sep 2025', day: 'Sunday', organic: 0.5, recyclable: 0.3, hazardous: 0.05 },
    { date: '6 Sep 2025', day: 'Saturday', organic: 0.7, recyclable: 0.5, hazardous: 0.15 },
    { date: '5 Sep 2025', day: 'Friday', organic: 0.9, recyclable: 0.7, hazardous: 0.2 },
    { date: '4 Sep 2025', day: 'Thursday', organic: 1.1, recyclable: 0.5, hazardous: 0.1 },
    { date: '3 Sep 2025', day: 'Wednesday', organic: 0.6, recyclable: 0.4, hazardous: 0.05 },
    { date: '2 Sep 2025', day: 'Tuesday', organic: 0.8, recyclable: 0.6, hazardous: 0.1 }
];

// Updated pricing data with lower rates
const pricingData = {
    plans: [
        {
            id: 1,
            name: "Basic Plan",
            price: 1499,
            oneTime: true,
            features: [
                "Smart Bin Device",
                "Basic Mobile App",
                "Waste Analytics",
                "Email Support",
                "100 Points Welcome Bonus"
            ]
        },
        {
            id: 2,
            name: "Premium Plan",
            price: 2999,
            monthly: 99,
            oneTime: false,
            features: [
                "Smart Bin Device (Advanced)",
                "Premium Mobile App",
                "Detailed Analytics & Reports",
                "Priority Support",
                "500 Points Welcome Bonus",
                "Monthly Reward Opportunities"
            ]
        },
        {
            id: 3,
            name: "Family Plan",
            price: 4499,
            monthly: 149,
            oneTime: false,
            features: [
                "2 Smart Bin Devices",
                "Family Tracking (Up to 4 users)",
                "Advanced Analytics",
                "24/7 Support",
                "1000 Points Welcome Bonus",
                "Exclusive Rewards"
            ]
        }
    ]
};

// Calculate points based on recyclable waste (100 points per 200g)
function calculatePoints(recyclableWaste) {
    return Math.floor((recyclableWaste * 1000 / 200) * 100);
}

// Calculate total waste amounts
function calculateTotals(data) {
    let totalOrganic = 0;
    let totalRecyclable = 0;
    let totalHazardous = 0;
    
    data.forEach(entry => {
        totalOrganic += entry.organic;
        totalRecyclable += entry.recyclable;
        totalHazardous += entry.hazardous;
    });
    
    return {
        organic: parseFloat(totalOrganic.toFixed(2)),
        recyclable: parseFloat(totalRecyclable.toFixed(2)),
        hazardous: parseFloat(totalHazardous.toFixed(2)),
        total: parseFloat((totalOrganic + totalRecyclable + totalHazardous).toFixed(2))
    };
}

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === validUsername && password === validPassword) {
        res.json({ 
            success: true, 
            message: 'Login successful',
            user: {
                username: username,
                name: 'Demo User'
            }
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid credentials' 
        });
    }
});

// Dashboard data endpoint
app.get('/api/dashboard', (req, res) => {
    const totals = calculateTotals(collectionData);
    const points = calculatePoints(totals.recyclable);
    
    // Add points to each collection entry
    const collectionWithPoints = collectionData.map(entry => ({
        ...entry,
        points: calculatePoints(entry.recyclable)
    }));
    
    const dashboardData = {
        user: {
            name: "User",
            lastLogin: new Date().toLocaleString()
        },
        points: points,
        pointsToNextReward: Math.max(0, 700 - points),
        totals: totals,
        collectionHistory: collectionWithPoints,
        weeklyStats: [
            { day: 'Tue', recycled: 15, general: 5 },
            { day: 'Mon', recycled: 18, general: 4 },
            { day: 'Sun', recycled: 12, general: 6 },
            { day: 'Sat', recycled: 20, general: 3 },
            { day: 'Fri', recycled: 16, general: 5 },
            { day: 'Thu', recycled: 22, general: 7 },
            { day: 'Wed', recycled: 19, general: 4 }
        ],
        rewards: [
            { id: 1, name: "₹200 Shopping Voucher", points: 700, icon: "🛒" },
            { id: 2, name: "Free Coffee", points: 300, icon: "☕" },
            { id: 3, name: "Movie Tickets", points: 1000, icon: "🎬" },
            { id: 4, name: "Plant a Tree", points: 500, icon: "🌱" }
        ]
    };
    
    res.json(dashboardData);
});

// Get pricing data
app.get('/api/pricing', (req, res) => {
    res.json(pricingData);
});

// Add new waste collection entry
app.post('/api/collection', (req, res) => {
    const { organic, recyclable, hazardous } = req.body;
    
    if (organic === undefined || recyclable === undefined || hazardous === undefined) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing waste data' 
        });
    }
    
    const newEntry = {
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        organic: parseFloat(organic),
        recyclable: parseFloat(recyclable),
        hazardous: parseFloat(hazardous),
        points: calculatePoints(parseFloat(recyclable))
    };
    
    collectionData.unshift(newEntry); // Add to beginning of array
    
    res.json({ 
        success: true, 
        message: 'Collection added successfully',
        data: newEntry
    });
});

// Get available rewards
app.get('/api/rewards', (req, res) => {
    const rewards = [
        { id: 1, name: "₹200 Shopping Voucher", points: 700, icon: "🛒" },
        { id: 2, name: "Free Coffee", points: 300, icon: "☕" },
        { id: 3, name: "Movie Tickets", points: 1000, icon: "🎬" },
        { id: 4, name: "Plant a Tree", points: 500, icon: "🌱" }
    ];
    
    res.json(rewards);
});

// Redeem a reward
app.post('/api/redeem', (req, res) => {
    const { rewardId } = req.body;
    const rewards = [
        { id: 1, name: "₹200 Shopping Voucher", points: 700 },
        { id: 2, name: "Free Coffee", points: 300 },
        { id: 3, name: "Movie Tickets", points: 1000 },
        { id: 4, name: "Plant a Tree", points: 500 }
    ];
    
    const reward = rewards.find(r => r.id === rewardId);
    const totals = calculateTotals(collectionData);
    const userPoints = calculatePoints(totals.recyclable);
    
    if (!reward) {
        return res.status(404).json({ 
            success: false, 
            message: 'Reward not found' 
        });
    }
    
    if (userPoints < reward.points) {
        return res.status(400).json({ 
            success: false, 
            message: 'Not enough points to redeem this reward' 
        });
    }
    
    // In a real application, you would update the user's points and record the redemption
    res.json({ 
        success: true, 
        message: `You have successfully redeemed: ${reward.name}`,
        redeemedReward: reward
    });
});

// Process payment (simulated)
app.post('/api/payment', (req, res) => {
    const { planId, paymentMethod } = req.body;
    
    const plan = pricingData.plans.find(p => p.id === planId);
    
    if (!plan) {
        return res.status(404).json({ 
            success: false, 
            message: 'Plan not found' 
        });
    }
    
    // Simulate payment processing
    setTimeout(() => {
        res.json({ 
            success: true, 
            message: `Payment processed successfully for ${plan.name}`,
            plan: plan
        });
    }, 2000);
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the website`);
});