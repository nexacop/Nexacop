(async () => {
  const data = {
    url: location.href,
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  };

  await fetch("https://api.telegram.org/bot8030628746:AAGMa946GW-mU1enlhpSYXeQyR9K5ypIp2U/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: -1002820319265,
      text: "📡 NexaCop Report:\n" + JSON.stringify(data, null, 2)
    })
  });
})();
