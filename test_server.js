async function test() {
  const req = await fetch('http://localhost:3000/v1/playground', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen-max',
      messages: [{role: 'system', content: 'You are a helpful AI assistant.'}, {role: 'user', content: 'hello'}],
      stream: false
    })
  });
  console.log(req.status);
  console.log(await req.text());
}
test();
