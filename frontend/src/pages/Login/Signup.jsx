import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";

const initialState = {
    email: "",
    password: ""
};

export function Signup() {
    const navigate = useNavigate()

    const formik = useFormik({
        initialValues: initialState,

        validationSchema: yup.object({
            email: yup
                .string()
                .email("Invalid email")
                .required("Email is required"),

            password: yup
                .string()
                .min(6, "Password must be at least 6 characters")
                .required("Password is required")
        }),

        onSubmit: async (values) => {

            try {

                const response = await fetch(
                    "http://localhost:5000/signup",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(values)
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    alert(data.message);
                    return;
                }

                alert("Signup successful");
                formik.resetForm();
                navigate('/login');


            } catch (error) {

                console.log(error);
                alert("Server error");

            }
        }
    });

    return (
        <div className="flex justify-center">

            <div className="m-10 p-10">

                <h1 className="text-center font-bold text-2xl">
                    Sign up
                </h1>

                <form onSubmit={formik.handleSubmit}>

                    <div>
                        <label className="block">
                            Email
                        </label>

                        <input
                            type="email"
                            {...formik.getFieldProps("email")}
                            placeholder="gamer@gmail.com"
                            className="p-1 border rounded-sm my-2"
                        />

                        {formik.touched.email &&
                        formik.errors.email ? (
                            <p>{formik.errors.email}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="block">
                            Password
                        </label>

                        <input
                            type="password"
                            {...formik.getFieldProps("password")}
                            placeholder="********"
                            className="p-1 border rounded-sm my-2"
                        />

                        {formik.touched.password &&
                        formik.errors.password ? (
                            <p>{formik.errors.password}</p>
                        ) : null}
                    </div>


                    <button
                        type="submit"
                        className="border rounded-sm py-2 px-4 font-bold mt-2 ml-20"
                    >
                        Signup
                    </button>

                </form>

            </div>

        </div>
    );
}