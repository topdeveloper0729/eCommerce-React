const rentalsDb = require('../db/helpers/rentals');

module.exports = setInterval(updateRentalStatuses, 1000 * 60 * 1);

async function updateRentalStatuses() {
    // get current date:
    const currentDate = new Date();
    
    let updates = [];
    let update = null;
    try {
        // Move upcoming rentals to active or completed:
        const upcomingRentals = await rentalsDb.getAllRentalsByStatus(['upcoming']);

        for (let rental of upcomingRentals) {
            if (currentDate >= rental.StartDate && currentDate <= rental.EndDate) {
                // update rental status to active
                update = await rentalsDb.updateRentalStatus(rental.RentalID, 'active');
                updates.push(update);
            }
            if (currentDate > rental.EndDate) {
                // update rental status to completed
                update = await rentalsDb.updateRentalStatus(rental.RentalID, 'completed');
                updates.push(update);
            }
        }

        // Move active rentals to completed:
        const activeRentals = await rentalsDb.getAllRentalsByStatus(['active']);

        for (let rental of activeRentals) {
            if (currentDate > rental.EndDate) {
                // update rental status to completed:
                update = await rentalsDb.updateRentalStatus(rental.RentalID, 'completed');
                updates.push(update);
            }
        }
    }
    catch(error) {
        console.log('Error while updating Rental statuses:', error.message);
    }
}
