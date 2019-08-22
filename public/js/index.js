//import Controller from './Controller'

window.addEventListener('load', async event => {
    try {
        res = await axios.get('js/test.json')
        controller = new Controller()
        controller.setupQuestion(res.data)
    } catch (e) {
        console.error(e)
    }
})
