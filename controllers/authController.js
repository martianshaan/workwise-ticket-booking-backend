const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const validateUserInput = (data) => {
    const errors = [];
    
    if (!data.username || typeof data.username !== 'string') {
        errors.push('Username is required and must be a string');
    } else if (data.username.length < 3 || data.username.length > 50) {
        errors.push('Username must be between 3 and 50 characters');
    }

    if (!data.email || typeof data.email !== 'string') {
        errors.push('Email is required and must be a string');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            errors.push('Invalid email format');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};


const syncUser = async (req, res) => {
    try {
        // Input validation
        const { isValid, errors } = validateUserInput(req.body);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input data',
                errors
            });
        }

        const { username, email } = req.body;

        // Add logging with request ID for better traceability
        const requestId = req.headers['x-request-id'] || Date.now().toString();
        console.log(`[${requestId}] Syncing user - Username: ${username}, Email: ${email}`);

        // Find existing user
        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                // Exclude sensitive fields like password
            }
        });

        // If user exists, update their information
        if (existingUser) {
            const updatedUser = await prisma.user.update({
                where: { email },
                data: { username },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    createdAt: true,
                }
            });

            return res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: updatedUser
            });
        }

        // Create new user with secure password handling
        // const hashedPassword = await bcrypt.hash('12345678', 10); // In practice, use a proper password generation/handling system
        
        const hashedPassword="AABBSHSHS115"
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
            }
        });

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: newUser
        });

    } catch (error) {
        console.error(`Error in syncUser: ${error.message}`, error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    syncUser
};