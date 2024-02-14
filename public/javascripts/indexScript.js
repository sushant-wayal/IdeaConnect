let seehide = document.querySelector("#seehide");

let see = true;

seehide.addEventListener("click", () =>{
    if (!see) {
        seehide.src = "images/icons/see.png";
        seehide.alt = "see";
        document.querySelector("#passwordinput").type = "password";
        see = true;
    }
    else {
        seehide.src = "images/icons/hide.png";
        seehide.alt = "hide";
        document.querySelector("#passwordinput").type = "text";
        see = false;
    }
})

let kx = 768;
let ky = 195;

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

// Mouse Follower

// fill Effect 

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

let login = document.querySelector("#login");
fill(login,"gray",0.9);

let signin = document.querySelector("#signin");
let signup = document.querySelector("#signup");

fill(signin,"gray",0.9);
fill(signup,"gray",0.9);

// fill Effect