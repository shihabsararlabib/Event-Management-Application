import React, {useState} from 'react'
import "./Login.css"
import email_icon from "../../assets/icons/email.png"
import pass_icon from "../../assets/icons/password.png"
import TextNIcon from '../../components/TextNIcon/TextNIcon'
import { ROUTES } from '../../routes/RouterConfig'
import axios from "axios"
import { useNavigate } from "react-router-dom";
const styles = {
    body: "login__body flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 font-openSans py-12",
    login__container: "login__container flex flex-col items-center justify-around py-[60px] border-0 border-purple-100 px-[30px] bg-white rounded-2xl shadow-2xl m-2 w-[35%] max-w-[420px]",
    login__title: "login__title text-left w-full",
    login__title_h1: "login__title--h1 text-5xl pb-0 font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent",
    login__form: "login__form w-full pt-[60px]",
    RemFor_container: "flex justify-between items-center mt-[30px]",
    checkbox__container: "checkbox__container flex items-center",
    checkbox__box: "accent-purple-600",
    checkbox__label: "ml-1 checkbox__label text-gray-700",
    forgotPass__conatiner: "ml-auto",
    forgotPass__link: "forgotPass__link hover:underline hover:decoration-solid text-purple-600 hover:text-purple-700",
    login__button: "login__button text-center w-full text-2xl font-semibold block mt-[30px] rounded-full py-[12px] text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl transform hover:scale-105",
    signUp__container: "flex mt-[40px] text-gray-700",
    signUp__text: "",
    signup__link: "login__signup pl-2 font-semibold hover:underline hover:decoration-solid text-purple-600 hover:text-purple-700"
}

function Login() {
    const navigate=useNavigate();

    const [loginForm, setLoginForm] = useState({
        email : "",
        password : "",
        rememberMe : false
    })
    
    const handleSubmit = async (event) => {
        event.preventDefault()
        console.log(loginForm)

        await axios.post('http://localhost:8080/api/user/login', {
      email:loginForm.email,
      password:loginForm.password
    }).then(res =>{
      console.log(res);
      console.log(res.data);
      
      // Store token and user data in localStorage
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      
      navigate("/dashboard");
    }).catch(err=>{
     alert(err);
    })
    }

    const handleChange = (event) =>{
        const {name, value , type , checked} = event.target

        setLoginForm(prevState =>{
            
            return{
                ...prevState,
                [name] : type==="checkbox" ? checked : value
            }
        })
    };


    return (
        <div className={styles.body}>
            <div className={styles.login__container}>
                <div className={styles.login__title}>
                    <h1 className={styles.login__title_h1}>Log In</h1>
                </div>
                <form onSubmit={handleSubmit} className={styles.login__form}>

                    <TextNIcon
                        icon={email_icon}
                        type="email"
                        placeholder="Email address" 
                        name = "email"
                        value = {loginForm.email}
                        changehandler = {handleChange}
                    />
                    <TextNIcon
                        icon={pass_icon}
                        type="password"
                        placeholder="Password"
                        name = "password"
                        value = {loginForm.password}
                        changehandler = {handleChange}
                    />

                    <div className={styles.RemFor_container}>
                        <div className={styles.checkbox__container}>
                            <input type="checkbox" 
                                    id='rememberMe' className={styles.checkbox__box} 
                                    name = "rememberMe"
                                    onChange={handleChange}
                                    checked = {loginForm.rememberMe}

                            />
                            <label htmlFor="rememberMe" className={styles.checkbox__label}>Remember Me</label>
                        </div>
                        <div className={styles.forgotPass__conatiner}>
                            <a href="" className={styles.forgotPass__link}>Forgot Password?</a>
                        </div>
                    </div>

                    <button type="submit" className={styles.login__button}>Log In</button>
                </form>
                <div className={styles.signUp__container}>
                    <p className={styles.signUp__text}> Need an account?</p>
                    <a href={ROUTES.SignUp} className={styles.signup__link}>Sign Up</a>
                </div>
            </div>
        </div>
    )
}

export default Login