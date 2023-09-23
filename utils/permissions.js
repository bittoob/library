// permissions.js

// Define your permission data as an array of objects
const permissions = [
    {
      code: 'READ_POST',
      description: 'Read posts',
    },
    {
      code: 'WRITE_POST',
      description: 'Write new posts',
    },
    {
      code: 'DELETE_POST',
      description: 'Delete posts',
    },
    // Add more permissions as needed
  ];
  
  // Export the permissions array
  module.exports = permissions;