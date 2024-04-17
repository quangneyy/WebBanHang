import axios from 'axios';

// nơi tương tác với API
export const callFetchCategory = () => {
    return axios.get('https://jsonplaceholder.typicode.com/users')
}