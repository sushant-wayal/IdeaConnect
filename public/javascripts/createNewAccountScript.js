let countries = document.querySelector("#countries");

fetch("https://restcountries.com/v3/all")
.then(res => {
	if (!res.ok) {
		throw new Error(`HTTP Server api error! Status : ${res.status}`);
	}
	return res.json();
})
.then(data => {
	let Countries = [];
	data.forEach(country => {
		Countries.push(country.name.common);
	})
	Countries = Countries.sort();
	Countries.forEach((country,ind) => {
        let option = document.createElement("option");
        option.id = `option${ind+1}`;
        option.innerText = country;
        countries.append(option);
    })
})
.catch(error => {
	console.error("Fetch Error : ",error);
})

let countryCode = document.querySelector("#countryCode");
let defaultCountryCode = countryCode.firstElementChild;

countries.addEventListener("change", () => {
    console.log("change");
    let country = countries.options[countries.selectedIndex].text.toLowerCase();
    fetch(`https://restcountries.com/v3.1/name/${country}?fullText=true`)
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP Server error! Status : ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        if (data.status !== 404) {
            countryCode.innerHTML = "";
            if (data[0].idd.suffixes.length > 1) {
                countryCode.append(defaultCountryCode);
            }
            data[0].idd.suffixes.forEach((suffix,ind) => {
                let option = document.createElement("option");
                option.id = `option${ind+1}`;
                option.innerText = data[0].idd.root+suffix;
                countryCode.append(option);
            })
        }
    })
    .catch(error => {
        console.error("fetch error : ",error);
    })
})

let kx = 13;
let ky = 1017;

// Mouse Follower

function createMouseFollower() {
    let mf = document.createElement("div");
    mf.style.borderRadius = "50%";
    mf.style.height = "10px";
    mf.style.width = "10px";
    mf.style.backgroundColor = "#000000";
    mf.style.position = "fixed";
    mf.style.zIndex = "-1";
    mf.style.animation = "birth 0.4s linear 0s 1 normal"
    document.body.append(mf);
    return mf;
}

let initial = true;
let mf;

const mfMove = (evt) => {
    if (initial) {
        mf = createMouseFollower();
        initial = false;
    }
    gsap.to(mf,{
        x: evt.clientX-kx,
        y: evt.clientY-ky,
        duration: 0.4,
    })
}

document.addEventListener("mousemove", mfMove);

//Mouse Follower

// fill effect

const fill = (ele,color,time) => {
    ele.addEventListener("mousemove", () => {
        document.removeEventListener("mousemove",mfMove);
        gsap.to(ele,{
            background: `linear-gradient(to top, ${color} 0%, ${color} 100%, transparent 100%, transparent 100%)`,
            color: "white",
            duration: time,
        })
        mf.style.opacity = 0;
    })
    ele.addEventListener("mouseout", (e) => {
        if (!ele.contains(e.relatedTarget)) {
            document.addEventListener("mousemove",mfMove);
            gsap.to(ele,{
                background: `linear-gradient(to top, ${color} 0%, ${color} 0%, transparent 0%, transparent 100%)`,
                color: "black",
                duration: time,
            })
            mf.style.opacity = 1;
        }
    })
}

let registerForm = document.querySelector("#registerForm");
fill(registerForm,"gray",0.9);

let signin = document.querySelector("#signin");
let signup = document.querySelector("#signup");

fill(signin,"gray",0.9);
fill(signup,"gray",0.9);

// fill effect

let profilePhoto = document.querySelector("#profilePhoto");

profilePhoto.addEventListener("click", () => {
    let form = document.createElement("form");
    form.action = "/registerProfilePhoto";
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

let seehide = document.querySelector("#seehide");

let see = true;

seehide.addEventListener("click", () =>{
    if (!see) {
        seehide.src = "images/icons/see.png";
        seehide.alt = "see";
        document.querySelector("#passwordInput").type = "password";
        see = true;
    }
    else {
        seehide.src = "images/icons/hide.png";
        seehide.alt = "hide";
        document.querySelector("#passwordInput").type = "text";
        see = false;
    }
})
