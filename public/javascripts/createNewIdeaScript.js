let newCategory = document.querySelector("#category");

let inputCategories = document.querySelector("#inputCategories");

inputCategories.addEventListener("mousemove", () => {
    newCategory.focus();
})

let categories = [];

let categoriesContainer = document.createElement("div");
categoriesContainer.style.position = "fixed";
categoriesContainer.style.left = "101vw";

document.querySelector("#newIdea").append(categoriesContainer);

let categoryNum = 1;

newCategory.addEventListener("keydown", (evt) => {
    if (evt.key === "Enter") {
        evt.preventDefault();
        let nextNewCategory = document.createElement("div");
        if (categories.indexOf(newCategory.value) === -1) {
            categories.push(newCategory.value);
            nextNewCategory.innerText = newCategory.value;
            let categoryInput = document.createElement("input")
            categoryInput.type = "text";
            categoryInput.value = newCategory.value;
            categoryInput.name = `categoryInput${categoryNum}`;
            categoriesContainer.append(categoryInput);
            nextNewCategory.style.position = "relative";
            let cross = document.createElement("div");
            cross.innerText = "x";
            cross.style.height = "20px";
            cross.style.width = "20px";
            cross.style.backgroundColor = "black";
            cross.style.color = "gray";
            cross.style.borderRadius = "50%";
            cross.style.display = "inline-block";
            cross.style.cursor = "pointer";
            cross.style.textAlign = "center";
            cross.style.position = "absolute";
            cross.style.top = "-5px";
            cross.style.right = "-5px";
            nextNewCategory.style.paddingRight = "8px";
            nextNewCategory.append(cross);
            nextNewCategory.classList.add("categoryAdded");
            inputCategories.insertBefore(nextNewCategory,newCategory);
            cross.addEventListener("click", () => {
                categories.splice(categories.indexOf(nextNewCategory.innerText,1));
                categoryInput.remove();
                nextNewCategory.remove();
            });
            categoryNum++;
        }
        newCategory.value = "";
    }
})

let steps = document.querySelector("#steps");

let num = 1;

const removeStep = (ele,progressBar) => {
    if (ele == ele.parentNode.children[1]) {
        ele.nextSibling.remove();
        if (ele.nextSibling.children[2]) {
            ele.children[2].value = ele.nextSibling.children[2].value;
        }
        else {
            ele.nextSibling.remove();
            ele.children[2].value = ele.nextSibling.nextSibling.children[2].value;
            ele.nextSibling.remove();
        }
        ele.nextSibling.remove();
    }
    else {
        ele.remove();
        if (progressBar) {
            progressBar.remove();
        }
    }
}

const checkbox = (ele) => {
    let children = Array.from(steps.children);
    if (ele.children[1].checked) {
        for (let step in children) {
            if (children[step] == ele) {
                break;
            }
            else {
                if (children[step].children.length > 0) {
                    children[step].children[1].checked = true;
                }
            }
        }
    }
    else {
        let start = false;
        for (let step in children) {
            if (children[step] == ele) {
                start = true;
            }
            if (start) {
                if (children[step].children.length > 0) {
                    children[step].children[1].checked = false;
                }
            }
        }
    }
}

const addStep = (after) => {
    let progressBar = document.createElement("div");
    progressBar.classList.add("progressBar");
    progressBar.id = `progressBar${num+1}`;
    let newStep = document.createElement("div");
    newStep.classList.add("stepContainer");
    newStep.innerHTML = `<div id="addStep${num}" class="addStep">
                            <p> + </p>
                        </div>
                        <input type="checkbox" id="checkbox${num}" name="checkbox${num}" class="checkbox">
                        <input type="text" id="stepInput${num}" name="stepInput${num}" value="New Step" class="step">
                        <div id="removeStep${num}" class="removeStep">
                            <p> - </p>
                        </div>`
    if (after.nextSibling) {
        steps.insertBefore(progressBar,after.nextSibling);
        steps.insertBefore(newStep,progressBar.nextSibling);
    }
    else {
        steps.append(progressBar);
        steps.append(newStep);
    }
    let input = document.querySelector(`#stepInput${num}`);
    input.focus();
    input.setSelectionRange(0,input.value.length);
    document.querySelector(`#addStep${num}`).onclick = () => addStep(newStep);
    document.querySelector(`#removeStep${num}`).onclick = () => removeStep(newStep,progressBar);
    document.querySelector(`#checkbox${num}`).onclick = () => checkbox(newStep);
    num++;
}

let startAddStep = document.querySelector("#startAddStep");
let completeAddStep = document.querySelector("#completeAddStep");

startAddStep.onclick = () => addStep(startAddStep.parentNode);
completeAddStep.onclick = () => addStep(completeAddStep.parentNode);

let startRemoveStep = document.querySelector("#startRemoveStep");
let completeRemoveStep = document.querySelector("#completeRemoveStep");

startRemoveStep.onclick = () => removeStep(startRemoveStep.parentNode);
completeRemoveStep.onclick = () => removeStep(completeRemoveStep.parentNode,document.querySelector("#progressBar1"));

let startCheckbox = document.querySelector("#startCheckbox");
let completeCheckbox = document.querySelector("#completeCheckbox");

startCheckbox.onclick = () => checkbox(startCheckbox.parentNode);
completeCheckbox.onclick = () => checkbox(completeCheckbox.parentNode);

let addMedia = document.querySelector("#addMedia");

addMedia.addEventListener("click", () => {
    let form = document.createElement("form");
    form.action = "/addMedia";
    form.method = "post";
    form.enctype = "multipart/form-data";
    let input = document.createElement("input");
    input.type = "file";
    input.name = "file";
    form.append(input);
    let submit = document.createElement("button");
    submit.type = "submit";
    form.append(submit);
    input.click();
    input.addEventListener("change", () => {
        document.body.appendChild(form);
        submit.click();
        document.body.removeChild(form);
    })
})
