export async function request(method, url, data = null) {
  try {
    let res = null;
    if (data) {
      res = await fetch(url, {
        method,
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify(data),
      });
    } else {
      res = await fetch(url, {
        method,
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
      });
    }
    return { status: res.status, data: await res.json() };
  } catch (err) {
    console.log(err);
    return null;
  }
}
