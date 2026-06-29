const BASE_URL = "http://localhost:5000/api";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function addToCart(data: {
  user_id: number;
  product_id: number;
  quantity: number;
}) {
  const response = await fetch(
    "http://localhost:5000/api/cart",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
}

export async function addToWishlist(data: {
  user_id: number;
  product_id: number;
}) {
  const response = await fetch(
    "http://localhost:5000/api/wishlist",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
}

export async function createPaymentOrder(amount: number) {
  const response = await fetch(
    "http://localhost:5000/api/payment/create-order",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    }
  );

  return response.json();
}

export async function getCart(userId: number) {
  const response = await fetch(
    `http://localhost:5000/api/cart/${userId}`
  );

  return response.json();
}

export async function createOrder(data: any) {
  const response = await fetch(
    "http://localhost:5000/api/orders",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
}

export async function getOrders(userId: number) {
  const response = await fetch(
    `http://localhost:5000/api/orders/${userId}`
  );

  return response.json();
}

export async function getWishlist(userId: number) {
  const response = await fetch(
    `http://localhost:5000/api/wishlist/${userId}`
  );

  return response.json();
}

export async function removeWishlist(id: number) {
  const response = await fetch(
    `http://localhost:5000/api/wishlist/${id}`,
    {
      method: "DELETE",
    }
  );

  return response.json();
}

export async function createProduct(data: any) {
  const response = await fetch(
    "http://localhost:5000/api/products",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
}

export async function updateProduct(
  id: number,
  data: any
) {
  const response = await fetch(
    `http://localhost:5000/api/products/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
}

export async function deleteProduct(id: number) {
  const response = await fetch(
    `http://localhost:5000/api/products/${id}`,
    {
      method: "DELETE",
    }
  );

  return response.json();
}

export async function getAdminUsers() {
  const response = await fetch(
    "http://localhost:5000/api/admin/users"
  );

  return response.json();
}

export async function getAdminProducts() {
  const response = await fetch(
    "http://localhost:5000/api/admin/products"
  );

  return response.json();
}

export async function getAdminOrders() {
  const response = await fetch(
    "http://localhost:5000/api/admin/orders"
  );

  return response.json();
}

export async function updateUserRole(
  id: number,
  role: string
) {
  const response = await fetch(
    `http://localhost:5000/api/admin/users/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    }
  );

  return response.json();
}

export async function deleteAdminProduct(id: number) {
  const response = await fetch(
    `http://localhost:5000/api/admin/products/${id}`,
    {
      method: "DELETE",
    }
  );

  return response.json();
}