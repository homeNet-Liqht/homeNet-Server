const locationController = require("../controllers/location");

const locationUpdate = (socket) => {
  socket.on("locationUpdate", async (data) => {

    try {
      await locationController.currentLocation(data);

      console.log("User location updated successfully");
    } catch (error) {
      console.error("Error updating user location:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
};

module.exports = locationUpdate;
