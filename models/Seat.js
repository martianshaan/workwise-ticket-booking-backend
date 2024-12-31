// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// class Seat {
//     async getAllSeats() {
//         return await prisma.seat.findMany();
//     }

//     async reserveSeats(seatIds, username) {
//         await prisma.$transaction(
//             seatIds.map(id => 
//                 prisma.seat.update({
//                     where: { id },
//                     data: { 
//                         isReserved: true,
//                         reservedBy: username
//                     }
//                 })
//             )
//         );
//         return await this.getAllSeats();
//     }

//     async cancelSeats(seatIds) {
//         await prisma.$transaction(
//             seatIds.map(id => 
//                 prisma.seat.update({
//                     where: { id },
//                     data: {
//                         isReserved: false,
//                         reservedBy: null
//                     }
//                 })
//             )
//         );
//         return await this.getAllSeats();
//     }
// }

// module.exports = new Seat();
