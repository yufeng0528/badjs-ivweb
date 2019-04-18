/**
 * Created by coverguo on 2015/1/12.
 */

var UserApplyService = require('../../service/UserApplyService'),
    EmailService = require('../../service/EmailService'),
    isError = function (res, error) {
        if (error) {
            res.json({ ret: 1, msg: error });
            return true;
        }
        return false;
    };


var userAction = {
    addUserApply: function (userApply, req, res) {
        if (userApply.userName == "") {
            return res.json({ ret: 1002, msg: "userName为空" });
        }
        userApply.createTime = new Date();
        var userApplyService = new UserApplyService();
        var emailService = new EmailService();
        userApplyService.add(userApply, function (err, user, items) {
            if (isError(res, err)) {
                return;
            }
            var loginUser = req.session.user;
            emailService.sendApplySuccessEmail(user, loginUser, items);
            res.json({ ret: 0, msg: "success-add" });
        });
    },

    remove: function (remove, req, res) {
        if (remove.id == "") {
            res.json({ ret: 1002, msg: "id为空" });
            return;
        }
        var userApplyService = new UserApplyService();
        userApplyService.remove(remove, function (err, items) {
            if (isError(res, err)) {
                return;
            }
            res.json({ ret: 0, msg: "success-remove" });
        });

    },

    auth: function (auth, req, res) {
        if (auth.id == "") {
            res.json({ ret: 1002, msg: "id为空" });
            return;
        }
        var userApplyService = new UserApplyService();
        userApplyService.auth(auth, function (err, items) {
            if (isError(res, err)) {
                return;
            }
            res.json({ ret: 0, msg: "success-update" });
        });
    },

    setRole: function (param, req, res) {
        if (param.id == "") {
            res.json({ ret: 1002, msg: "id为空" });
            return;
        }
        var userApplyService = new UserApplyService();
        userApplyService.setRole(param, function (err, items) {
            if (isError(res, err)) {
                return;
            }
            res.json({ ret: 0, msg: "success-update" });
        });
    }

};

module.exports = userAction;

