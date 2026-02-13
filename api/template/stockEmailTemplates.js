/**
 * Stock notification email templates
 */

export const stockNotificationEmail = (product, delivery, quantity) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">🚀 New Stock Just Arrived!</h2>
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
      <p><strong>Product:</strong> ${product.productName}</p>
      <p><strong>Price:</strong> ₱${delivery.shopPrice}</p>
      <p><strong>Available Quantity:</strong> ${quantity} units</p>
      <p><strong>Arrival Date:</strong> ${new Date(
        delivery.dateDelivery
      ).toLocaleDateString()}</p>
    </div>
    <p style="margin-top: 20px;">Happy shopping!</p>
    <p><em>RM Toys Team</em></p>
  </div>
`;
