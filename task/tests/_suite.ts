import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('Sample task tests', function () {

    before( function() {

    });

    after(() => {

    });

    it('should succeed with simple inputs', function(done: Mocha.Done) {
        this.timeout(1000);
    
        let tp = path.join(__dirname, 'success.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
    
        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, false, 'should have succeeded');
        assert.equal(tr.warningIssues.length, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 1, "should have one error");
        console.log(tr.stdout);
        done();
    });

    it('it should fail if tool returns 1', function(done: Mocha.Done) {
        this.timeout(1000);
    
        let tp = path.join(__dirname, 'failure.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
    
        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, false, 'should have failed');
        assert.equal(tr.warningIssues.length, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 1, "should have 1 error issue");
        assert.equal(tr.errorIssues[0], 'Endpoint auth data not present: bad', 'error issue output');    
        done();
    }); 
});