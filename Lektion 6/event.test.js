test("adding and removing event-listener", () => {
  document.body.innerHTML = `<button id="button"/>`;

  const button = document.getElementById("button");

  function handleClick() {
    throw new Error("The click-handler should not have been called.");
  }

  button.addEventListener("click", handleClick);
  button.removeEventListener("click", handleClick);

  button.click();
});

test("using onclick event-handler without event", (done) => {
  document.body.innerHTML = `<button id="button"/>`;

  const button = document.getElementById("button");

  button.onclick = () => {
    done();
  };

  button.click();
});
