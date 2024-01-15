// XXX even though ethers is not used in the code below, it's very likely
// it will be used by any DApp, so we are already including it here
const { ethers } = require("ethers");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

async function handle_advance(data) {
  const payload = data["payload"];
  const string = ethers.toUtf8String(payload);

  console.log(string);
  const guess = parseInt(string);

  console.log(`Your Guess is: ${guess}`);

  console.log("Received advance request data " + JSON.stringify(data));

  let secret_number = Math.floor(Math.random() * 100) + 1;

  console.log(`The Secret Number is:, ${secret_number}`);

  // let guess = "";

  // while (true) {
  //   guess = parseInt(prompt("Please input your guess."));
  //   console.log(`You guessed: ${guess}`);

  if (guess < secret_number) {
    console.log("Your guess is Too small!, try again");
  } else if (guess > secret_number) {
    console.log("Your guess is Too big!, try again");
  } else {
    console.log("You are a Hero, You win!");
    // break;
  }
  // }

  return "accept";
}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));
  return "accept";
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();
