import React, { useState } from 'react'
import AboutEvent from './Forms/AboutEvent/AboutEvent'
import BasicDetails from './Forms/BasicDetails/BasicDetails'
import Contact from './Forms/Contact/Contact'
import Navbar from '../../components/Navbar/Navbar'

const styles = {
    container : "min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50",
    form_selector: "flex items-center justify-center gap-8 text-lg p-8 bg-white shadow-md border-b-2 border-purple-100",
    form: "max-w-4xl mx-auto p-8",
    link: "px-6 py-3 rounded-full font-semibold transition-all hover:bg-purple-100 text-gray-700 hover:text-purple-600",
    activeLink: "px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
}
function AddEvent() {

    const [details, setDetails] = useState(
        {
            event: "",
            date: "",
            description: "",
            venue: "",
            speakers: [],
            strength: 0,
            contact : 0,
            instagram : "",
            linkedIn: "" 
        }
    )

    const [form, setForm] = useState('basic')
    const handleForm = (event) => {
        event.preventDefault()
        const id = event.target.id

        setForm(id)

        console.log(id)
    }

    const handleData = (event) =>{
        const {name, value} = event.target

        setDetails(prevState =>{

            return {
                ...prevState,
                [name]: value
            }
        })
        console.table(details)
    }
    return (
        <div className={styles.container}>
            <Navbar />
            <div className="text-center py-12">
                <h1 className="text-5xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Create New Event
                    </span>
                </h1>
                <p className="text-xl text-gray-600">Fill in the details to create your event</p>
            </div>
            <div className={styles.form_selector}>
                <button 
                    id='basic' 
                    onClick={handleForm} 
                    className={form === 'basic' ? styles.activeLink : styles.link}
                >
                    📝 Basic Details
                </button>
                <button 
                    id='aboutEvent' 
                    onClick={handleForm} 
                    className={form === 'aboutEvent' ? styles.activeLink : styles.link}
                >
                    📋 About Event
                </button>
                <button 
                    id='contact' 
                    onClick={handleForm} 
                    className={form === 'contact' ? styles.activeLink : styles.link}
                >
                    📞 Contact
                </button>
            </div>
            <form className={styles.form}>
                {form === 'basic' ? <BasicDetails state={details} changeHandler={handleData} /> : ""}
                {form === 'aboutEvent' ? <AboutEvent state={details} changeHandler={handleData} /> : ""}
                {form === 'contact' ? <Contact state={details} changeHandler={handleData} /> : ""}
            </form>
        </div>
    )
}

export default AddEvent