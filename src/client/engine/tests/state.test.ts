import * as chai from 'chai';
import * as chaiPromised from 'chai-as-promised';
import {State} from '../state';

chai.use(chaiPromised);

const expect = chai.expect;
const state = new State();

// well I guess I'll just write these as integration tests
describe('State should', () => {
    it('eventually equal 5', () =>
        expect(state.set('likes', {
            is: 'content/test/inherit2.toml'
        })).to.eventually.deep.equal({
            rambo: 'awesome'
        })
    );
});
