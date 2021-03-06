const db = require('../db.js');

module.exports = {
    createUser,
    getUserInfo,
    updateUserDetails,
    getUserLocation,
    getUserName,
    getUserEmail,
}

function createUser(newUser) {
    return db('users')
        .insert(newUser)
        .returning('id')
        .then(ids => ids[0]);
}

function getUserInfo(uid) {
    return db
        .select([
            'users.uid',
            'users.first_name',
            'users.last_name',
            'users.email',
            'users.full_address',
            'users.image_id',
            'images.url as image_url'
        ])
        .from('users')
        .innerJoin('images', 'users.image_id', 'images.id')
        .where('users.uid', uid)
        .first();
}

function getUserName(uid) {
    return db 
        .select([
            'users.first_name',
            'users.last_name'
        ])
        .from('users')
        .where('users.uid', uid)
        .first();
        // .then(users => {
        //     return users[0];
        // });
}

function getUserLocation(uid) {
    return db
        .select([
            'users.full_address',
            'users.street_number',
            'users.street_name',
            'users.city',
            'users.county',
            'users.state',
            'users.country',
            'users.zip_code',
            'users.lat',
            'users.lng',
            'users.place_id'
        ])
        .from('users')
        .where('users.uid', uid)
        .first();
        // .then(locations => {
        //     return locations[0];
        // });
}

function updateUserDetails(uid, user) {
    return db('users')
            .where('uid', uid)
            .update(user);
}

function getUserEmail(uid) {
    return db 
        .select([
            'users.email',
        ])
        .from('users')
        .where('users.uid', uid)
        .first();
        // .then(users => {
        //     return users[0];
        // });
}