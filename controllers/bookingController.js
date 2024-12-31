const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BookingController = {
    async createBooking(req, res) {
        const { userId, seatIds } = req.body;

        if (!seatIds?.length || seatIds.length > 7) {
            return res.status(400).json({ 
                error: 'Can only book 1-7 seats at a time' 
            });
        }

        try {
            const booking = await prisma.$transaction(async (tx) => {
                const seats = await tx.seat.findMany({
                    where: { id: { in: seatIds } }
                });

                if (seats.some(seat => seat.isReserved)) {
                    throw new Error('Some seats are already reserved');
                }

                const booking = await tx.booking.create({
                    data: {
                        userId,
                        seatIds,
                        status: 'ACTIVE'
                    },
                    include: { seats: true }
                });

                await tx.seat.updateMany({
                    where: { id: { in: seatIds } },
                    data: { isReserved: true, reservedBy: userId }
                });

                return booking;
            });

            res.status(201).json(booking);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    async getBookings(req, res) {
        const { userId } = req.body;
        try {
            const bookings = await prisma.booking.findMany({
                where: { userId },
                include: { seats: true },
                orderBy: { createdAt: 'desc' }
            });
            res.json(bookings);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch bookings' });
        }
    },

    async cancelBooking(req, res) {
        const { bookingId, userId } = req.body;
        
        try {
            const result = await prisma.$transaction(async (tx) => {
                const booking = await tx.booking.findFirst({
                    where: { 
                        id: bookingId,
                        userId,
                        status: 'ACTIVE'
                    },
                    include: { seats: true }
                });

                if (!booking) {
                    throw new Error('Booking not found or already cancelled');
                }

                await tx.seat.updateMany({
                    where: { id: { in: booking.seats.map(s => s.id) } },
                    data: { isReserved: false, reservedBy: null }
                });

                return await tx.booking.update({
                    where: { id: bookingId },
                    data: { status: 'CANCELLED' },
                    include: { seats: true }
                });
            });

            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = BookingController;
