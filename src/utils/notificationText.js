const notificationContain = (type, sender, receiver, title) => {

  switch (type) {
    case "invite":
      return {
        title: `Invitation from ${sender}`,
        body: `${sender} has invited you to a family! Check it out now!`,
      };
    case "join":
      return {
        title: `An accepting from ${receiver}`,
        body: `${receiver} has accepted your family invitation! Check it out now!`,
      };
    case "time":
      return {
        title: `The call of duty`,
        body: `${title} is almost finish! Check it out now!`,
      };
    case "location":
      return {
        title: `${receiver} stayed in the warning zone`,
        body: `${receiver} has stayed in the warning zone for too long! Check it out now!`,
      };
    case "task":
      return {
        title: `New task from ${sender}`,
        body: `${sender} has assigned you a ${title} task! Check it out now!`,
      };
    case "accept":
      return {
        title: `Accepting from ${receiver}`,
        body: `${receiver} has accepted your task! Check it out now!`,
      };
    case "finish":
      return {
        title: `${receiver} finished the ${title} task`,
        body: `${title} was done by ${receiver}! Check it out now!`,
      };
    case "update":
      return {
        title: `Task update from ${sender}`,
        body: `${title} has been updated! Check it out now!`,
      };
    case "delete":
      return {
        title: `Task removing from ${sender}`,
        body: `${title} has been removed by ${sender}!`,
      };

    default:
      break;
  }
};

module.exports = notificationContain