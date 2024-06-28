import axios from "axios";
import Footer from "../Components/General/Footer"
import SignInUpNav from "../Components/General/SignInUpNav"
import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RiLoader2Line } from "@remixicon/react";

const SignUp = () => {
    const [profileImage, setProfileImage] = useState("../../../../images/ProfileImageUpload/defaultOther.jpg");
    const [profileImageSet, setProfileImageSet] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [gender, setGender] = useState("");
    const [DOB, setDOB] = useState("dd-mm-yyyy");
    const [country, setCountry] = useState("Select the Country");
    const [countryCode, setCountryCode] = useState("Select Country Code");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email,setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [see,setSee] = useState(false);

    const countries = useLoaderData();

    const [countryCodes, setCountryCodes] = useState([["Select Country Code",true]]);

    const [uploading, setUploading] = useState(false);

    const navigate = useNavigate();

    const countryChange = async (e) => {
        const thisCountry = e.target.value;
        setCountry(thisCountry);
        setCountryCodes([]);
        let { data } = await axios.get(`https://restcountries.com/v3.1/name/${thisCountry}?fullText=true`);
        const { root, suffixes } = data[0].idd;
        if (suffixes.length > 1) {
            setCountryCodes(prev => [...prev, ["Select Country Code",true]]);
            suffixes.forEach(suffix => setCountryCodes(prev => [...prev, [root+suffix,false]]))
        }
        else setCountryCodes([[root+suffixes[0],false]]);
    }

    const upload = async (formData) => {
        const { data : { success, data : { url } } } = await axios.post("http://localhost:3000/api/v1/images/upload",formData,{
            headers: {
                "Content-Type": "multipart/form-data",
            }
        })

        if (success) {
            setProfileImageSet(true);
            setProfileImage(url);
        }
        else console.log("Check BackEnd");
    }
    const fileChange = async (e) => {
        let formData = new FormData();
        formData.append("file",e.target.files[0]);
        setUploading(true);
        await upload(formData);
        setUploading(false);
        document.querySelector("#profileImage").remove();
    }
    const imageUpload = () => {
        let input = document.createElement("input");
        input.type = "file";
        input.id = "profileImage";
        document.body.append(input);
        input.onchange = fileChange;
        input.click();
    }
    const genderChange = (e) => {
        let profileImage = "";
        if (e.target.value == "male") {
            setGender("male");
            profileImage = "../../../../images/ProfileImageUpload/defaultMale.jpg";
        }
        else if (e.target.value == "female") {
            setGender("female");
            profileImage = "../../../../images/ProfileImageUpload/defaultFemale.jpg";
        }
        else {
            setGender("other");
            profileImage = "../../../../images/ProfileImageUpload/defaultOther.jpg";
        }
        if (!profileImageSet) setProfileImage(profileImage);
    }
    const register = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Registering & Logging In...")
        const { data : { data : {
            authenticated,
            accessToken,
            refreshToken
        } } } = await axios.post("http://localhost:3000/api/v1/users/register",{
            username,
            password,
            firstName,
            lastName,
            countryCode,
            phoneNumber,
            email,
            DOB,
            gender,
            bio,
            profileImage,
        });
        if (authenticated) {
            localStorage.setItem("accessToken",accessToken);
            localStorage.setItem("refreshToken",refreshToken);
            navigate("/ideas");
            toast.success("Registered & Logged In Successfully", { id: toastId });
        }
        else alert("Something went wrong. Please try Again");
    }
    return (
        <div className="flex flex-col justify-between items-center">
            <SignInUpNav/>
            <div className="flex flex-col justify-between gap-5 items-center w-full relative top-20">
                <form
                    onSubmit={register}
                    className="bg-[#797270] flex flex-col gap-7 p-4 w-[max(36%,350px)] rounded-3xl"
                >
                    {uploading ?
                        <div className="flex justify-center items-center h-40 w-40 object-cover rounded-full border-2 border-black border-solid relative left-1/2 -translate-x-1/2">
                            <RiLoader2Line size={24} className="animate-spin"/>
                        </div>
                        :
                        <img
                            onClick={imageUpload}
                            className="h-40 w-40 object-cover rounded-full relative left-1/2 -translate-x-1/2 cursor-pointer"
                            src={profileImage}
                            alt="Profile Photo"
                        />}
                    <div className="flex justify-between gap-3">
                        <input
                            onChange={(e) => setFirstName(e.target.value)}
                            value={firstName}
                            className="py-1 px-3 w-full bg-[#C1EDCC] placeholder:text-black/90 rounded-full text-black"
                            type="text"
                            placeholder="First"
                        />
                        <input
                            onChange={(e) => setLastName(e.target.value)}
                            value={lastName}
                            className="py-1 px-3 w-full bg-[#C1EDCC] placeholder:text-black/90 rounded-full text-black"
                            type="text"
                            placeholder="Last (optional)"
                        />
                    </div>
                    <input
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        className="py-1 px-3 w-60 bg-[#C1EDCC] placeholder:text-black/90 rounded-full text-black"
                        type="text"
                        placeholder="Username"
                    />
                    <div className="relative">
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            className="py-1 px-3 w-60 bg-[#C1EDCC] placeholder:text-black/90 rounded-full text-black"
                            type={see ? "text" : "password"}
                            placeholder="Password"
                        />
                        <img
                            onClick={() => setSee(!see)}
                            className="absolute h-7 left-[200px] bottom-1 cursor-pointer"
                            src={`../../../../images/${see ? "hide" : "see"}.png`}
                            alt="see"
                        />
                    </div>
                    <div className="flex justify-start items-center gap-5 text-lg">
                        <p> Gender : </p>
                        <label
                            className="cursor-pointer"
                            htmlFor="male"
                        >
                            <input
                                onChange={genderChange}
                                checked={gender == "male"}
                                id="male"
                                type="radio"
                                value="male"
                                name="gender"
                            /> Male
                        </label>
                        <label
                            className="cursor-pointer"
                            htmlFor="female"
                        >
                            <input
                                onChange={genderChange}
                                checked={gender == "female"}
                                id="female"
                                type="radio"
                                value="female"
                                name="gender"
                            /> Female
                        </label>
                        <label
                            className="cursor-pointer"
                            htmlFor="other"
                        >
                            <input
                                onChange={genderChange}
                                checked={gender == "other"}
                                id="other"
                                type="radio"
                                value="other"
                                name="gender"
                            /> other
                        </label>
                    </div>
                    <div className="flex justify-start gap-5 items-center">
                        <p> DOB : </p>
                        <input
                            onChange={(e) => setDOB(e.target.value)}
                            value={DOB}
                            className="py-1 px-3 w-40 bg-[#C1EDCC] placeholder:text-black/90 rounded-full text-black"
                            type="date"
                        />
                    </div>
                    <select
                        value={country}
                        onChange={countryChange}
                        className="py-1 px-3 w-60 bg-[#C1EDCC] placeholder:text-black/90 rounded-full text-black"
                    >
                        <option disabled> Select the Country </option>
                        {countries.map(country => (
                            <option key={country}>{country}</option>
                        ))}
                    </select>
                    <div className="flex flex-col justify-center gap-8 ">
                        <div className="flex flex-col xl:flex-row justify-start gap-1 md:gap-3">
                            <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="py-1 px-3 w-52 bg-[#C1EDCC] placeholder:text-black/90 rounded-full text-black"
                            >
                                {countryCodes.map(thisCode => (
                                    <option disabled={thisCode[1]} key={thisCode[0]}>{thisCode[0]}</option>
                                ))}
                            </select>
                            <input
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="py-1 px-3 w-60 xl:w-1/2 bg-[#C1EDCC] placeholder:text-black/90 rounded-full text-black"
                                type="number"
                                placeholder="Phone Number"
                            />
                        </div>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="py-1 px-3 w-60 bg-[#C1EDCC] placeholder:text-black/90 rounded-full text-black"
                            type="email"
                            placeholder="Email"
                        />
                    </div>
                    <input
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="py-1 px-3 w-60 bg-[#C1EDCC] placeholder:text-black/90 rounded-full text-black"
                        type="text"
                        placeholder="bio"
                    />
                    <button
                        type="submit"
                        className="p-1 bg-[#5F5956] rounded-2xl relative left-1/2 -translate-x-1/2 w-24"
                    >
                        Register
                    </button>
                </form>
                <Footer styling={"w-[98%] relative bottom-2 rounded-2xl"}/>
            </div>
        </div>
    )
}

export default SignUp