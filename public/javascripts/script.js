let div = document.querySelector("div");

div.addEventListener("click", () => {
    console.log("clicked");
    let form = document.createElement("form");
    form.action = "/uploadProfilePhoto";
    form.method = "post";
    form.enctype = "multipart/form-data";
    let input = document.createElement("input");
    input.type = "file";
    input.name = "file";
    let submit = document.createElement("button");
    form.append(input);
    form.append(submit);
    input.click();
    input.addEventListener("change", () => {
        document.body.appendChild(form);
        submit.click();
        document.body.removeChild(form);
    })
})