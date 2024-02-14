let ideaDescriptions = document.querySelectorAll(".ideaDescription");
ideaDescriptions.forEach(ideaDescription => {
    let seeing = false;
    ideaDescription.addEventListener("click", () => {
        if (!seeing) {
            gsap.to(ideaDescription,{
                height: 290,
                backgroundColor: "gray",
                color: "white",
                duration: 0.3,
            })
            seeing = true;
        } else {
            gsap.to(ideaDescription,{
                height: 40,
                backgroundColor: "transparent",
                color: "black",
                duration: 0.3,
            })
            seeing = false;
        }
    })
})

let categories = document.querySelectorAll(".category");
categories.forEach(category => {
    let seeing = false;
    category.addEventListener("click", () => {
        if (!seeing) {
            let ideaId = category.parentNode.children[0].innerText;
            let currCategories;
            fetch(`../api/ideas/${ideaId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP api Server error! Status : ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                currCategories = data.categories;
                gsap.to(category,{
                    width: 260,
                    height: 250,
                    zIndex: 1,
                    duration: 0.3,
                })
                category.innerText = "";
                if (currCategories.length == 0) {
                    category.innerText = "No Categories for This Idea"
                }
                currCategories.forEach(currCategory => {
                    let currCategoryDiv = document.createElement("div");
                    currCategoryDiv.innerText = currCategory;
                    currCategoryDiv.classList.add("currCategoryDiv");
                    category.append(currCategoryDiv);
                })
                seeing = true;
            })
            .catch(error => {
                console.error("Fetch Error : ",error)
            })
        }
        else {
            while (category.firstChild) {
                category.removeChild(category.firstChild);
            }
            category.innerText = "Category";
            gsap.to(category,{
                width: 80,
                height: 25,
                zIndex: 0,
                duration: 0.3,
            })
            seeing = false;
        }
    })
})

const checkbox = (ele,progressBar,evt) => {
    evt.stopPropagation();
    let children = Array.from(progressBar.children);
    if (ele.children[0].checked) {
        for (let step of children) {
            if (step == ele) {
                break;
            }
            else {
                if (step.children.length > 0) {
                    step.children[0].checked = true;
                }
            }
        }
    }
    else {
        let start = false;
        for (let step of children) {
            if (step == ele) {
                start = true;
            }
            if (start) {
                if (step.children.length > 0) {
                    step.children[0].checked = false;
                }
            }
        }
    }
}

let progressBars = document.querySelectorAll(".progressBar");
progressBars.forEach(progressBar => {
    let seeing = false;
    let progress;
    let steps;
    let progressPer = progressBar.dataset.progress;
    progressBar.style.background = `linear-gradient(to right, black 0%, black ${progressPer}%, transparent ${progressPer}%, transparent 100%)`;
    progressBar.addEventListener("click", () => {
        if (!seeing) {
            let ideaId = progressBar.parentNode.children[0].innerText;
            fetch(`../api/ideas/${ideaId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP api server error ! Status : ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                steps = data.steps;
                progress = data.progress;
                gsap.to(progressBar, {
                    height: 290,
                    borderRadius: "10 10 0 0",
                    duration: 0.3,
                })
                steps.forEach((step,ind) => {
                    let currStep = document.createElement("div");
                    let currCheckbox = document.createElement("input");
                    currCheckbox.type = "checkbox";
                    if (progressBar.parentNode.children[0].dataset.sameUser == "false") {
                        currCheckbox.disabled = true;
                    }
                    else {
                        currCheckbox.disabled = false;
                    }
                    if (ind < progress) {
                        currCheckbox.checked = true;
                    }
                    currCheckbox.onclick = (evt) => checkbox(currStep,progressBar,evt);
                    currStep.append(currCheckbox);
                    let currStepText = document.createElement("p");
                    currStepText.innerText = step;
                    currStepText.classList.add("currStepText");
                    currStep.append(currStepText);
                    currStep.classList.add("currStep");
                    let verticalProgressBar = document.createElement("div");
                    verticalProgressBar.classList.add("verticalProgressBar");
                    progressBar.append(currStep);
                    progressBar.append(verticalProgressBar);
                })
                progressBar.removeChild(progressBar.lastChild);
                progressBar.style.background = "";
                progressBar.style.backgroundColor = "gray";
            })
            seeing = true;
        } else {
            if (progressBar.parentNode.children[0].dataset.sameUser == "true") {
                let modifiedProgress = 0;
                for (let step of Array.from(progressBar.children)){
                    if (step.children.length > 0) {
                        if (step.firstChild.checked == true) {
                            modifiedProgress++;
                        }
                        else {
                            break;
                        }
                    }
                }
                progress = modifiedProgress;
                fetch(`/api/updateProgress/${progressBar.parentNode.children[0].innerText}/${progress}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP api Server Error ! Status : ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    if (data == "done") {
                        gsap.to(progressBar,{
                            height: 0,
                            duration: 0.3,
                            background: `linear-gradient(to right, black 0%, black ${(progress/steps.length)*100}%, transparent ${(progress/steps.length)*100}%, transparent 100%)`,
                            borderRadius: 0,
                        })
                        while (progressBar.firstChild) {
                            progressBar.removeChild(progressBar.firstChild);
                        }
                    }
                })
            } else {
                gsap.to(progressBar,{
                    height: 0,
                    duration: 0.3,
                    background: `linear-gradient(to right, black 0%, black ${(progress/steps.length)*100}%, transparent ${(progress/steps.length)*100}%, transparent 100%)`,
                    borderRadius: 0,
                })
                while (progressBar.firstChild) {
                    progressBar.removeChild(progressBar.firstChild);
                }
            }
            gsap.to(progressBar,{
                height: 0,
                duration: 0.3,
                background: `linear-gradient(to right, black 0%, black ${(progress/steps.length)*100}%, transparent ${(progress/steps.length)*100}%, transparent 100%)`,
                borderRadius: 0,
            })
            while (progressBar.firstChild) {
                progressBar.removeChild(progressBar.firstChild);
            }
            seeing = false;
        }
    })
})

let intresteds = document.querySelectorAll(".intrested");
intresteds.forEach(intrested => {
    let seeing = false;
    let intrestedText = intrested.innerText;
    intrested.addEventListener("click", () => {
        if (intrestedText != "Intrested") {
            if (!seeing) {
                fetch(`/api/intrestedUser/${intrested.dataset.ideaId}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP api Server Error ! Status : ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    intrested.innerText = "";
                    gsap.to(intrested,{
                        height: 240,
                        width: 250,
                        padding: 5,
                    })
                    data.forEach(user => {
                        let intrestedUserDiv = document.createElement("div");
                        let intrestedUserProfile = document.createElement("img");
                        intrestedUserProfile.src = `../images/uploads/${user.profileImage}`;
                        intrestedUserProfile.classList.add("intrestedUserProfile");
                        intrestedUserDiv.append(intrestedUserProfile);
                        let intrestedUsername = document.createElement("p");
                        intrestedUsername.innerText = user.username;
                        intrestedUsername.classList.add("intrestedUsername");
                        intrestedUserDiv.append(intrestedUsername);
                        intrestedUserDiv.classList.add("intrestedUserDiv");
                        intrested.append(intrestedUserDiv);
                    })
                })
                seeing = true;
            }
            else {
                while (intrested.firstChild) {
                    intrested.removeChild(intrested.firstChild);
                }
                gsap.to(intrested,{
                    height: 25,
                    width: 90,
                    padding: 0,
                    duration: 0.3,
                })
                intrested.innerText = intrestedText;
                seeing = false;
            }
        }
    })
})

let likeImg = document.querySelectorAll(".likeImg");
likeImg.forEach(likeImg => {
    fetch(`/api/isLiked/${likeImg.dataset.userId}/${likeImg.dataset.ideaId}`)
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP api server Error ! Status : ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        let liked = data;
        if (liked) {
            likeImg.src = "/images/icons/liked.png";
        }
        else {
            likeImg.src = "/images/icons/like.png";
        }
        likeImg.addEventListener("click", () => {
            if (!liked) {
                fetch(`/api/like/${likeImg.dataset.userId}/${likeImg.dataset.ideaId}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP api server Error ! Status : ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    if (data == "done") {
                        likeImg.src = "../images/icons/liked.png";
                        let likeCount = likeImg.parentNode.children[1];
                        likeCount.innerText = parseInt(likeCount.innerText,10)+1;
                        liked = true;
                    }
                })
                liked = true;
            }
        })
    })
})

let likeCounts = document.querySelectorAll(".likeCount");
likeCounts.forEach(likeCount => {
    let thisProgressBar = likeCount.parentNode.parentNode.parentNode.children[6];
    let thisProgressBarBackground = thisProgressBar.style.background;
    let seeing = false;
    likeCount.addEventListener("click", () => {
        if (!seeing) {
            fetch(`/api/likedBy/${likeCount.dataset.ideaId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP api Server Error ! Status : ${res.status}`);
                }
                return res.json();
            })
            .then(likedBy => {
                gsap.to(thisProgressBar,{
                    height: 290,
                    background: "gray",
                    borderRadius: "10 10 0 0",
                    duration: 0.3,
                })
                likedBy.forEach(user => {
                    let userDiv = document.createElement("div");
                    let userProfile = document.createElement("img");
                    userProfile.src = `../images/uploads/${user.profileImage}`;
                    userProfile.classList.add("userProfile");
                    userDiv.append(userProfile);
                    let username = document.createElement("p");
                    username.innerText = user.username;
                    username.classList.add("username");
                    userDiv.append(username);
                    userDiv.classList.add("userDiv");
                    thisProgressBar.append(userDiv);
                })
                thisProgressBar.style.pointerEvents = "none";
                seeing = true;
            })
        } else {
            thisProgressBar.style.pointerEvents = "auto";
            while (thisProgressBar.firstChild) {
                thisProgressBar.removeChild(thisProgressBar.firstChild);
            }
            gsap.to(thisProgressBar,{
                height: 0,
                borderRadius: 0,
                background: thisProgressBarBackground,
                duration: 0.3,
            })
            seeing = false;
        }
    })
})
