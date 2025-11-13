// app/api/razorpay/route.js or pages/api/razorpay.js
import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const { amount, method, display_currency, display_amount } =
      await req.json();

    // Validate amount
    if (!amount || amount < 100) {
      return new Response(
        JSON.stringify({ error: "Amount must be at least 100 paise (₹1)" }),
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const orderOptions = {
      amount: Math.round(amount),
      currency: "INR", // Razorpay only supports INR for Indian merchants
      payment_capture: 1,
      notes: {
        display_currency: display_currency || "INR",
        display_amount: display_amount || (amount / 100).toString(),
        original_amount: amount.toString(),
      },
    };

    // Add payment method restrictions if provided
    if (method && method.length > 0) {
      orderOptions.method = method.join(",");
    }

    const order = await razorpay.orders.create(orderOptions);

    // Add display information to the response
    const orderWithDisplay = {
      ...order,
      display_currency: display_currency || "INR",
      display_amount: display_amount || amount / 100,
      exchange_rate_applied: display_currency !== "INR",
    };

    return new Response(JSON.stringify(orderWithDisplay), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Razorpay Error:", err);
    return new Response(
      JSON.stringify({
        error:
          err.error?.description || err.message || "Payment processing failed",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
