/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import nodemailer from 'nodemailer';
import moment from 'moment';
import config from '~/config';
import cwlog from 'chowa-log';

export interface MailOptions extends nodemailer.SendMailOptions {
    content: string[];
}

export async function send({ subject, content, attachments = [] }: MailOptions) {
    return new Promise(resolve => {
        const { host, port, secure, user, password, to } = config.smtp;

        if (!user || !password || !to) {
            return;
        }

        const html = `<!DOCTYPE HTML>
        <html>

        <head>
            <meta content="width=device-width" name="viewport" />
            <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
            <title>${subject}</title>
            <style type="text/css">
                body {
                    background-color: #f6f6f6;
                    font-family: sans-serif;
                    -webkit-font-smoothing: antialiased;
                    font-size: 14px;
                    line-height: 1.4;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }

                .mail-box {
                    max-width: 620px;
                    margin: auto;
                    padding: 22px 12px;
                }

                .mail-content {
                    background: #fff;
                    border-radius: 3px;
                    padding: 18px 16px 0 16px;
                }

                .to-user {
                    color: #454545;
                    margin-bottom: 10px
                }

                p {
                    padding: 0 26px;
                    margin-bottom: 6px;
                    color: #676767;
                    word-break: break-all
                }

                .send-time {
                    color: #898989;
                    text-align: right
                }

                .refer {
                    border-top: 1px solid#f5f5f5;
                    padding: 8px 0;
                    font-size: 12px;
                    color: #999
                }

                .logo {
                    width: 22px;
                    height: 22px;
                    float: right;
                }

                .copy {
                    text-align: center;
                    font-size: 12px;
                    padding: 12px 0;
                }

                .copy a {
                    color: #999;
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .copy a:hover {
                    color: #2d8cf0;
                }

            </style>
        </head>

        <body>
            <div class="mail-box">
                <div class="mail-content">
                    <div class="to-user">
                        运维报警，
                    </div>
                    ${content.map(str => `<p>${str}</p>`).join('')}
                    <p class="send-time">
                        ${moment().format('YYYY-MM-DD HH:mm:ss')}
                    </p>
                    <div class="refer">
                        此邮件由系统自动发送，请勿回复

                        <img class="logo" src='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMzkzcHgiIGhlaWdodD0iNDAwcHgiIHZpZXdCb3g9IjAgMCAzOTMgNDAwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPuWIhue7hCAzPC90aXRsZT4KICAgIDxkZWZzPgogICAgICAgIDxsaW5lYXJHcmFkaWVudCB4MT0iNTAlIiB5MT0iMCUiIHgyPSI1MCUiIHkyPSIxMDAlIiBpZD0ibGluZWFyR3JhZGllbnQtMSI+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiM2NzlDRjYiIG9mZnNldD0iMCUiPjwvc3RvcD4KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzQwNzJFRSIgb2Zmc2V0PSIxMDAlIj48L3N0b3A+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgICA8bGluZWFyR3JhZGllbnQgeDE9IjUwJSIgeTE9IjAlIiB4Mj0iNTAlIiB5Mj0iMTAwJSIgaWQ9ImxpbmVhckdyYWRpZW50LTIiPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMjlDQjk3IiBvZmZzZXQ9IjAlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMyQ0I1ODkiIG9mZnNldD0iMTAwJSI+PC9zdG9wPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8L2RlZnM+CiAgICA8ZyBpZD0i57uE5Lu2IiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0i5qiq5ZCRd2hpdGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC01MC4wMDAwMDAsIC0xMC4wMDAwMDApIiBmaWxsLXJ1bGU9Im5vbnplcm8iPgogICAgICAgICAgICA8ZyBpZD0i5YiG57uELTMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwLjAwMDAwMCwgMTAuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMCwyMDcuMDM1MjkgTDgxLjQ4NzIxODksMjA3LjAzNTI5IEwxNDUuNTM2OTAzLDI3MC4yMDk5NSBMMTk1LjkzNzU2NywyMTcuOTE3ODE4IEwyNTIuMTc4OTU2LDI3MS4zMzc1MjggTDMxNC4xNTUzMDcsMjA3LjAzNTI5IEwzOTEuODc1MTM1LDIwNy4wMzUyOSBMMjQ3Ljk0MjMzNywzNTEuNzUyNjQgTDE5Ny4zMzE4NDUsMjk3LjA4MTg3NyBMMTQ1LjMyNzA3NSwzNDkuMzcwMTE2IEwwLDIwNy4wMzUyOSBaIE0yMzQuODUxMDczLDM2NC45MTUyNjIgTDIwMC42OTgwMjcsMzk3LjE3Njk2OCBDMTk4LjA2ODg5OCwzOTkuODIwNDI4IDE5My44MDYyMzcsMzk5LjgyMDQyOCAxOTEuMTc3MTA4LDM5Ny4xNzY5NjggTDE1OC40MTgzMzksMzYyLjUzMjczOCBMMTk3LjMzMTg0NSwzMjMuNDA3MTIyIEwyMzQuODUxMDczLDM2NC45MTUyNjIgWiIgaWQ9IuW9oueKtiIgZmlsbD0idXJsKCNsaW5lYXJHcmFkaWVudC0xKSI+PC9wYXRoPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTAuNzAwNjc0MjQ2LDE5My40OTcyODMgTDE5MS4xNzcxMDgsMS45ODI1OTUxNyBDMTkzLjgwNjIzNywtMC42NjA4NjUwNTYgMTk4LjA2ODg5OCwtMC42NjA4NjUwNTYgMjAwLjY5ODAyNywxLjk4MjU5NTE3IEwzOTEuMTc0NDYsMTkzLjQ5NzI4MyBMMzEyLjQxNDE4MywxOTMuNDk3MjgzIEwxOTYuMjgxODk0LDc2LjczMTk3NTkgTDgwLjE0OTYwMzcsMTkzLjQ5NzI4MyBMMC43MDA2NzQyNDYsMTkzLjQ5NzI4MyBMMC43MDA2NzQyNDYsMTkzLjQ5NzI4MyBaIiBpZD0i6Lev5b6EIiBmaWxsPSJ1cmwoI2xpbmVhckdyYWRpZW50LTIpIj48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg=='/>
                    </div>
                </div>

                <div class="copy"><a href="https://www.chowa.cn">&copy;卓瓦科技 2020-${moment().year()}</a></div>
            </div>
        </body>

        </html>`;

        nodemailer
            .createTransport({
                host,
                port,
                secure,
                auth: {
                    user,
                    pass: password
                }
            })
            .sendMail(
                {
                    from: `e家宜业服务报警 <${user}>`,
                    to: to,
                    subject: `e家宜业服务报警「${subject}」`,
                    html,
                    attachments
                },
                err => {
                    if (err) {
                        cwlog.error('邮件发送失败！');
                        console.log(err);
                        resolve(false);
                    }

                    resolve(true);
                }
            );
    });
}
