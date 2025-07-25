// Utility for managing browser notifications
export class BrowserNotification {
  static async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async showDrawOfferNotification(offererName, gameId) {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) return;

    // Only show notification if tab is not active
    if (!document.hidden) return;

    const notification = new Notification('Chess Draw Offer', {
      body: `${offererName} has offered a draw in your chess game`,
      icon: '/kca.ico', // Assuming you have a chess icon
      badge: '/kca.ico',
      tag: `draw-offer-${gameId}`, // Prevents duplicate notifications
      requireInteraction: true, // Keeps notification until user interacts
      actions: [
        { action: 'accept', title: 'Accept Draw' },
        { action: 'decline', title: 'Decline' },
        { action: 'view', title: 'View Game' }
      ]
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 30 seconds
    setTimeout(() => {
      notification.close();
    }, 30000);

    return notification;
  }

  static async showGameEndNotification(result, reason) {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) return;

    let message = '';
    if (result === '1/2-1/2') {
      message = `Game ended in a draw${reason ? ` by ${reason}` : ''}`;
    } else if (result === '1-0') {
      message = `White won${reason ? ` by ${reason}` : ''}`;
    } else if (result === '0-1') {
      message = `Black won${reason ? ` by ${reason}` : ''}`;
    }

    const notification = new Notification('Chess Game Ended', {
      body: message,
      icon: '/kca.ico',
      badge: '/kca.ico',
      tag: 'game-ended'
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    return notification;
  }
}
