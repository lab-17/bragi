import { AudioContext } from 'standardized-audio-context-mock'
import BragiDefault, { Bragi } from '../../src'

describe('Root Integration tests', () => {
    it('should Bragi is named exported', () => {
        expect(Bragi).to.not.be.undefined
    })

    it('should Bragi exported as default', () => {
        expect(BragiDefault).to.deep.equal(Bragi)
    })

    it('should Bragi run in supported environment', () => {
        expect(new Bragi()).to.be.an.instanceOf(Bragi)
    })

    it('should Bragi run in whit Ponyfill', () => {
        expect(new Bragi({ ponyfill: { AudioContext } })).to.be.an.instanceOf(Bragi)
    })
})
