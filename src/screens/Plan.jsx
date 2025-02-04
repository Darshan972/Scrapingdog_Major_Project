import React,{useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import { isAuth } from '../helpers/auth';

const Plan = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if(!isAuth())
  {
    navigate('/login')
  }
  })
  return (
    <div>
        <h1>Hello</h1>
        </div>
  )
}

export default Plan;
 