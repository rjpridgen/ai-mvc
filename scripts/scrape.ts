const req = await fetch("https://a0e18017-cidr-browser-collector.rjpridgen.workers.dev", {
    method: "POST",
    body: JSON.stringify({url:"https://support.apple.com/en-us/101555"})
})

console.info(await req.text())