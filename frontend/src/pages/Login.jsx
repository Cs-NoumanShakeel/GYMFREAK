import Form from "../components/Form";
export default function Login() {

  return (
    <div>
     <Form route='api/token/' method='login'/>
    </div>
  );
}
