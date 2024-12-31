const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seatController = {
    async initializeSeats(req, res) {
        try {
            await prisma.seat.deleteMany({});

            const seats = [];
            const TOTAL_SEATS = 80;
            const SEATS_PER_ROW = 7;

            // Create all 80 seats without explicit IDs
            for (let seatNumber = 1; seatNumber <= TOTAL_SEATS; seatNumber++) {
                const row = Math.ceil(seatNumber / SEATS_PER_ROW);
                const column = ((seatNumber - 1) % SEATS_PER_ROW) + 1;

                seats.push({
                    row,
                    column,
                    isReserved: false,
                    reservedBy: null
                });
            }

            const createdSeats = await prisma.$transaction(
                seats.map(seat => prisma.seat.create({ data: seat }))
            );

            res.json(createdSeats);
        } catch (error) {
            console.error('Failed to initialize seats:', error);
            res.status(500).json({ error: 'Failed to initialize seats' });
        }
    },

    async getAllSeats(req, res) {
        try {
            let seats = await prisma.seat.findMany({
                orderBy: [
                    { row: 'asc' },
                    { column: 'asc' }
                ]
            });

            res.json(seats);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch seats' });
        }
    },

    async reserveSeats(req, res) {
        const { seatIds, username } = req.body;

        if (!seatIds?.length || seatIds.length > 7) {
            return res.status(400).json({
                error: 'Can only reserve 1-7 seats at a time'
            });
        }

        try {
            const user = await prisma.user.findUnique({
                where: { username: username }
            });

            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            const result = await prisma.$transaction(async (prisma) => {
                // Lock and get the current state of requested seats with their versions
                const existingSeats = await prisma.seat.findMany({
                    where: {
                        id: { in: seatIds }
                    },
                    orderBy: [
                        { row: 'asc' },
                        { column: 'asc' }
                    ]
                });

                if (existingSeats.length !== seatIds.length) {
                    throw new Error('INVALID_SEATS');
                }

                if (existingSeats.some(seat => seat.isReserved)) {
                    throw new Error('SEATS_ALREADY_RESERVED');
                }

                const booking = await prisma.booking.create({
                    data: {
                        userId: user.id,
                        status: 'CONFIRMED'
                    }
                });

                // Update seats with version check
                const updatePromises = existingSeats.map(seat =>
                    prisma.seat.updateMany({
                        where: {
                            id: seat.id,
                            version: seat.version, // Only update if version matches
                            isReserved: false
                        },
                        data: {
                            isReserved: true,
                            reservedBy: username,
                            bookingId: booking.id,
                            version: { increment: 1 } // Increment version on update
                        }
                    })
                );

                const updateResults = await Promise.all(updatePromises);
                
                // Check if all updates were successful
                const allUpdatesSuccessful = updateResults.every(result => result.count === 1);
                
                if (!allUpdatesSuccessful) {
                    throw new Error('CONCURRENT_UPDATE');
                }

                return await prisma.seat.findMany({
                    orderBy: [
                        { row: 'asc' },
                        { column: 'asc' }
                    ]
                });
            }, {
                isolationLevel: 'Serializable'
            });

            res.json(result);

        } catch (error) {
            console.error('Reservation error:', error);

            switch (error.message) {
                case 'INVALID_SEATS':
                    return res.status(400).json({
                        error: 'Invalid seat IDs'
                    });
                case 'SEATS_ALREADY_RESERVED':
                    return res.status(409).json({
                        error: 'Selected seats are no longer available'
                    });
                case 'CONCURRENT_UPDATE':
                    return res.status(409).json({
                        error: 'Seats were reserved by another user. Please refresh and try again'
                    });
                default:
                    return res.status(500).json({
                        error: 'Failed to reserve seats'
                    });
            }
        }
    },

    async cancelSeats(req, res) {
        const { seatIds } = req.body;

        if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
            return res.status(400).json({ error: 'Invalid request: seatIds are required' });
        }

        try {
            await prisma.$transaction(
                seatIds.map(id => prisma.seat.update({
                    where: { id },
                    data: { isReserved: false, reservedBy: null }
                }))
            );

            const updatedSeats = await prisma.seat.findMany({
                orderBy: [
                    { row: 'asc' },
                    { column: 'asc' }
                ]
            });
            res.json(updatedSeats);
        } catch (error) {
            res.status(500).json({ error: 'Failed to cancel seats' });
        }
    }
};

module.exports = seatController;