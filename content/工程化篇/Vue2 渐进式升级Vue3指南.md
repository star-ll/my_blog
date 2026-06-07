---
{"publish":true,"created":"2026-03-02T11:30:32.000+08:00","modified":"2026-03-02T11:30:32.000+08:00","cssclasses":""}
---

## 总体设计

任何框架底层核心都是围绕**运行时**和**编译时**设计开发，因此针对 vue 2 项目升级 vue 3，也应该从这两方面入手。

vue 运行时包含调度系统、响应式系统、API 层等，vue 3 相较于 vue 2 做了底层架构上的调整优化，比如在响应式机制上，使用 Proxy 替代之前的 Object.defineproperty，好在大部分修改都是渐进式的，大部分废弃的 API 是 deprecated 而不是 removed，只有极少数比如 filter、destoryed 等属于 removed，这部分需要手动调整，但是可以通过 `@vue/compat` 来实现 polyfill，来渐进式修改。

除了 Vue 自身外，Vue 还提供插件来增强框架能力，比如 Vuex、Vue-router，或者一些组件库等，在之前都需要通过 Vue.use 来注册，插件内部可能存在只依赖 vue 2 的逻辑语法，因此也需要同步升级到 vue 3 支持的版本。

在编译时方面，主要涉及两部分，一是 Vue 自身的编译器，比如 vue 的 SFC 编译成 js 文件，这就是 Vue 自身的编译器完成的，二是打包工具，Vue 3 之前主流是 vue-cli，当下主流的选择是 Vite，当然前者是必选项，后者是可选项。

总的来说，针对 Vue 2 升级 Vue 3 这一过程，总体设计为围绕运行时和编译时进行升级，在代码层面采用渐进式升级。

<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 565.60009765625 469.59983825683594" width="565.60009765625" height="469.59983825683594"><!-- svg-source:excalidraw --><metadata><!-- payload-type:application/vnd.excalidraw+json --><!-- payload-version:2 --><!-- payload-start -->eyJ2ZXJzaW9uIjoiMSIsImVuY29kaW5nIjoiYnN0cmluZyIsImNvbXByZXNzZWQiOnRydWUsImVuY29kZWQiOiJ4nO2ca1PiTFx1MDAxNsffz6ew2LdLpu+XebG1MqIjMqCIeNndslx1MDAwMlx1MDAwNIxEXHUwMDAyISjO1Hz37Y4+uUCQXGYg8tQwTk2VnU5yOjn/8zun0z0/P+3t5fzngZX7spezJi3Tsdue+ZT7p25/tLyR7fbVIVx1MDAxNPw+csdeK+h55/uD0ZfPn6MzjJb78HKW5VhcdTAwMGZW31x1MDAxZql+/1G/7+39XGb+VUfstj5cdTAwMTecWSedI6fj2s7hUal6MrlcdTAwMDG1l1x1MDAxYlx1MDAwNp3+MsazWr7Z7zpWdGii2olAXHUwMDA2lVJySlx1MDAwNZWY0/DoszpcbqXBXHUwMDAwXHUwMDAwXHUwMDE0XG4uhUBcXJDw8JPd9u9UXHUwMDE3SpBBVFx1MDAxZkFcdJFcYlxuXHUwMDEx9riz7O6dr0dcdTAwMGKpXHUwMDAx1T1cdTAwMDRkQlx1MDAxMophdJNcdTAwMTeLvuyBsGXke27P+uo6rqfN/lx1MDAwN7T0T2R002z1up477rejPiZti04n6tOxXHUwMDFk59x/XHUwMDBlrqyesnqiuanrX75aj6ba552lbti961sj/Vx1MDAxNmDY6lx1MDAwZcyW7Vx1MDAwN1x1MDAwZlxuRCPQ1lxyjtvRXHUwMDBiXHUwMDBiWm8n3eHRuYWad/Wnw8rtoOTes1x1MDAxZrnX4/+LTPfMXHUwMDA361i/2P7YccJmu9+29OvKNdFJwqp++9Wqn9GtXl85fm35XHUwMDE1jdGy2i/GQsogQ9FIYq4pZlorbj9wU0k4Jlxisuj12aNcdTAwMDPlnn5w1Y7pjKzoNWnTijHXjYY4XHUwMDFltM2XUyBnXFwq52GI4MizXHUwMDFju9+bXHUwMDFlv+O2etFdPsWGNaWGQrvbclx1MDAwNtVOwW9cdTAwMTRcdTAwMWbsy9Z167R6kFlcclx1MDAxNLBAXHLKLMqUZ0uekFx1MDAwM1x1MDAxMYGrI0IgUUbTXHUwMDE5MUDCXHKkelx1MDAxMMRcdTAwMTFhQGI0q1x1MDAwNrJu7+90WrIlt9v790eXl/fuIT1cdTAwMWU/+Df9xshcdTAwMTmeXFy54Vxy1imP8sryoFx1MDAxOEjBOU5cdTAwMTFcdTAwMDdkcp44XHUwMDEwROovp1x1MDAwNC6jjtC6yM6Yt/rWxI89rNDZW6XWwWFNXHUwMDBl5a11K+vdXHUwMDAzauFjllx1MDAwYvv9mnl87yq9dGtmpJdcdTAwMTjMi+ogMzBcdTAwMDdcdTAwMDBjxFxiZFx1MDAwMCVER1x1MDAxN4pcdTAwMGVxgynVQlx1MDAwNEGCYFx1MDAxMYD+ROBsTnLf0yWX6P6qLVxmXHUwMDA1oFx1MDAxNFx1MDAwYp4qrlx1MDAxOcmF4lx1MDAxMpxQypdcIk/CjNVcdTAwMDVcdTAwMTD5s/ZjNf5/P46tzypbXHUwMDFimDG37rh9/9z+XHUwMDEx2Fx1MDAwZVx1MDAxMq2H5oPtXHUwMDA0fp240r5jd/uBipTZlpeLP1x031ZZYdjhwW6349xqqYuadt/yjrNcdTAwMDDQ9eyu3Ted+lvWm2PfrVmjXHUwMDE3+31vbMWfj/XtL1lBXHUwMDAz0TfiQf7rXHUwMDE1LJmXXHUwMDAzu3hQXHUwMDE40eGg5l00y+tCMVx1MDAwNNigVJFcdTAwMTZCXHUwMDE1rDEg0eFcdTAwMWSMtyYyVFaGseBcdTAwMDJAJGFawECUzVx1MDAwYlx1MDAxOFx1MDAxMGHAuUAo4vW70/iw2D+SjTvgVvbvITuzy/vXt5dcdTAwMWZG43RrstBcdTAwMThDg1x1MDAwNSWCYFIjN6k7uFB3klx1MDAxYpBLSVSxJ0niXHUwMDAyOyBvRnbV7EBWUGVcdTAwMTBCmqovNtNcdTAwMWHqXHUwMDBiMqJcbnrBltLXOiUww+OB5/pu4N5bQONcdTAwMDVcZpymcYrt62Fx4Tu/2m9+Pek9VqlLfsijW8rR2lisUnSup4m4XHUwMDE0XHUwMDE4S0FmZ4mysJhFr2bH4rDD2oLC6erzRoxRhFh8XHUwMDAyKFx1MDAxNizk/GBcdTAwMDEoQ+rkTcK4dH2BXHUwMDBlruWZzX7UXHUwMDFm89V2vVxcMp1cdTAwMGaDcbo1WWCM3iqNVcW0UHhgUXFMd7J7T9mdZWcxVNKSXHUwMDE4q6wrtTqeqy+Vj2GuXHUwMDFjZFx1MDAxOXm9d3Xctlx1MDAwNlxuKvqq/+3vn1x1MDAxZW9cdTAwMDOTXHUwMDE3sHCaydFcYvZcdTAwMTJcdTAwMDNYXHUwMDBmmMVjXHUwMDE1Yf7tupO/q598XHUwMDEz9fr4uzvJXGZm9vr1XHUwMDA2SVx1MDAwMSTlIJpAXHRkQKAhVXhcdTAwMDBcdTAwMTJSijhekstrr5GbqIOaze1cdTAwMGVcdTAwMTCHtqyWmuMz6ZUxXHUwMDFlnttcdTAwMTeHw/vGu1x1MDAwNIjaylxc5lD9qJeXXHUwMDE2NlxiXHUwMDE2060hlinDlHMqNojlc94+qFx1MDAxY+Be91x0XHUwMDAwr/KEXHUwMDAxps/fPlxmy+nWZMCy0pJcdTAwMDGgSohcdTAwMTlElFxiMaU7ulB3hFx1MDAxOFhcdFfBW1winujxZ9fIm5PdeXYuI4YhVDE2VV9orr6UbzC5pLretUJujK3JNoB4XHUwMDAx+6ZBnDR7PfgtXHUwMDFks/b51/xccj5uWN1cdTAwMWL/XFw0n1x1MDAxZs3fwC80tM4hRVRwXHUwMDExc1x1MDAxMP3UODFYfNVDpKJcdTAwMWR9tyZcZtRXpq96gVxi6lx1MDAwMjftg/FcdTAwMWJTaFhQqUpiXHUwMDFjnfbu9GVFp9bjZVS6xabkhd5cdTAwMDRicfph9E23Jlx1MDAwYn1cdTAwMDFcdTAwMGWWJXHCmVx1MDAwMIyRhOzEYtlcdTAwMDHFZ501q8qaXHUwMDAxSmKF046+m5HdRXb6csKo/vY/s/Lihcxzi2KJXHUwMDE1fLdgsVJcdTAwMWF+82rQXHR0flx1MDAxY4RcdTAwMTdcdTAwMTAwXHUwMDA1wjPGr1x1MDAwN8VcdTAwMGXpn+TLldv7097Zw/CGl8enzWpmXHUwMDE0XHUwMDBiilx1MDAwMpRcIu0uXHUwMDAyTVXCXFxcdTAwMWTUi1x1MDAxY1x1MDAxMcVcdTAwMDRyXHUwMDE5XHUwMDEz/Fx1MDAwZcVbXHUwMDEzXHUwMDEzXHUwMDFhK6NcdTAwMThcbqzyMCBA2lx1MDAwNDWGZLo1RDFcdTAwMDFcZpONfiwuXHUwMDE3vpL7UpHWitWLk1x1MDAxM3NYM8eT7oehON2aXGYollxuxVx1MDAwMmtbXHUwMDA0Y3qKOYnihbIj2FBxWnJVXmGBXHUwMDA0RLvVWy+tm5PdZXZcdTAwMTTrVJcjwGRaqovBXFx9QUQkJVx1MDAxY6Gl1ka+L4zN/lYs21pAv1x1MDAxOVxmJ8xeXHUwMDBmgLvVhlmipSvImqM7XFxosFx1MDAwYs/Nvl5LUGooJUs9XHUwMDEzqfQ+VVx1MDAwYkOCXGasS2VcZijklEeTJjtcdTAwMDBvTSS4Wlx1MDAxZMCQXHUwMDEyrFwieWqAUFx1MDAwMWBugJBcdTAwMTCJoJDeXHUwMDFjgcmEIS6+177d1EpOpfx0eHHAwIdcdTAwMTE43ZosXHUwMDA0RsDgerlcdTAwMTXFXHUwMDFjU0ynvlx1MDAxMNOFumNcdTAwMDZRulx1MDAxNVx1MDAxY1xuxCBP38CzI/B76u46O4Ex4JJKmro5gcyfa1wigOuoKpeaa3pX/lx1MDAxYYaxXHL4XcC+afwmrF5cdTAwMGZ9YfW0dLtfqMOTTnFcdTAwMDCFw6l9dZSZvkTAObsknlx1MDAwM/2igM1cdTAwMDBhXHUwMDEyX1x1MDAwM1x1MDAxMu3ho8GEmuSMstRcdTAwMTRcXEVcdK4n1VSkQZJcdP7nXHUwMDA0hN9cdTAwMTHyzVx1MDAxYSpYqFx1MDAwMrmIP+DYXHUwMDEyXHUwMDEwPn+JlV6XXHUwMDA1iSDLKPztNSCQQoJp3KdX2J3XpPDRXHUwMDFmlHhz1Lj2rcNcdTAwMGK3cHybfVx1MDAxOVwiRMG8LZNEIIJgsthEnFx1MDAwNlx0JKZAUqSfxWy1qVSSvtk19HTOXGZcdTAwMTHnJVxcs6N3Wi3U5n93R2+uIVMkXHUwMDEyMOXuqaUknLvNXHUwMDBlMiTUiWg5lC2XKbq9YqXY6Y2fju/r5bY5eFx1MDAxY1x1MDAxNmj9tzJFyFx1MDAwNSFrylx1MDAxNNOtyZApUsJcZsr1blxuPPVh5DnILKBcdTAwMDG147/M46RhQqHFIFQyvVx1MDAxM0tnipvYaud7Zn80MD0rUab/LUXT+o00jzMsXHUwMDE5SaeAmFtGXHShcjxcdTAwMDG2XHUwMDAxXHUwMDAyM4ne49jK+9bDwFFcdTAwMTfO61xyZ7ZjeXv5f+2FO9B0Q37UaW1DPrhcdTAwMDBU0/ngMoNbT9oob0aNSWXfbrZcdTAwMWKs5FeeaTM/SJm5nUtUXHUwMDFj5HWUK3piObXXXHUwMDA3c1x1MDAxNMBcdTAwMTBcdTAwMDImVGWPcFx1MDAxYVGB7oJUxMZ4XHUwMDFlUnFcdTAwMDBdXHRUXGbkiMU2be2QXHUwMDFhRYf26kjliIIgXHUwMDA0pCF1dtF++N86qLpQQFx1MDAwNYTNXHUwMDEx9aZW8nx3iIan/UtcXDytu2OzOvowoqZbk4Goqlx1MDAxMDJcdTAwMTBSRMVIQv1/aiTlozfC6VxckkGVlMaPhnMvXHUwMDE4XHUwMDFiqpxcdTAwMTcppdlcdTAwMGWoiyVjZVx1MDAwNyqXgunlnanb3Mj8JbJcdTAwMTIrXG5jyNe/tH51oupP8S3H1php2P5WbHdbQKO0xVx1MDAwNKkj+G02fnpcclx1MDAxNjlzMDj31ZNcdTAwMGVDZ+7Rtp5cbqnbVPRcdTAwMWZcdTAwMWR0gqigNWBcdTAwMDVcdTAwMTH316df/1x1MDAwN+78RSYifQ==<!-- payload-end --></metadata><defs><style class="style-fonts">      @font-face { font-family: Excalifont; src: url(data:font/woff2;base64,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); }</style></defs><rect x="0" y="0" width="565.60009765625" height="469.59983825683594" fill="#ffffff"></rect><g stroke-linecap="round" transform="translate(11.199951171875 10) rotate(0 271.2000427246094 107.59999084472658)"><path d="M32 0 C179.28 4.11, 327.48 4.13, 510.4 0 C532.72 1.24, 545.43 8.26, 542.4 32 C547.33 70.3, 542.24 107.98, 542.4 183.2 C545.65 205.63, 533.94 213.08, 510.4 215.2 C390.71 216.81, 271.14 216.71, 32 215.2 C14.19 212.92, 3.09 201.2, 0 183.2 C1.56 124.9, 2.2 71.4, 0 32 C-2.52 13.98, 10.75 0.24, 32 0" stroke="none" stroke-width="0" fill="#a5d8ff"></path><path d="M32 0 C131.46 -0.43, 231.47 -1.09, 510.4 0 M32 0 C150.53 -1.85, 267.89 -1.48, 510.4 0 M510.4 0 C529.8 -0.61, 540.89 8.98, 542.4 32 M510.4 0 C530.09 0.24, 544.28 11.68, 542.4 32 M542.4 32 C545.01 72.09, 542.75 116.03, 542.4 183.2 M542.4 32 C541.86 65.58, 541.25 100.31, 542.4 183.2 M542.4 183.2 C541.37 205.79, 532.44 216.46, 510.4 215.2 M542.4 183.2 C540.81 203.26, 530.91 214.3, 510.4 215.2 M510.4 215.2 C335.8 214.49, 160.5 215.41, 32 215.2 M510.4 215.2 C398.16 215.32, 285.62 215.06, 32 215.2 M32 215.2 C10.66 216.57, -0.42 205.56, 0 183.2 M32 215.2 C9.34 216.11, -0.6 204.78, 0 183.2 M0 183.2 C0.91 133.11, -2.44 85.52, 0 32 M0 183.2 C1.13 142.74, 1.23 103.15, 0 32 M0 32 C1.32 9.7, 10.7 -1.57, 32 0 M0 32 C1.02 9.92, 8.88 -1.21, 32 0" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g><g stroke-linecap="round" transform="translate(35.19994354248047 38.799972534179716) rotate(0 73.60002136230469 22.5)"><path d="M11.25 0 C44.42 0.63, 73.74 1.37, 135.95 0 C144.17 -3.22, 147.96 2.09, 147.2 11.25 C146.64 18.05, 145.49 18.55, 147.2 33.75 C146.5 41.17, 141.54 46.01, 135.95 45 C102.41 46.06, 70.08 44.77, 11.25 45 C6.67 45.42, -1.64 42.79, 0 33.75 C2.13 29.97, 2.19 23.55, 0 11.25 C-0.24 5.18, 5.53 1.71, 11.25 0" stroke="none" stroke-width="0" fill="#ffc9c9"></path><path d="M11.25 0 C51.14 1.11, 88.9 -1.18, 135.95 0 M11.25 0 C48.65 -1.34, 83.52 -1.91, 135.95 0 M135.95 0 C144.46 -1.05, 148.84 5.05, 147.2 11.25 M135.95 0 C144.76 -0.42, 146.06 1.84, 147.2 11.25 M147.2 11.25 C149.06 19.44, 148.09 30.23, 147.2 33.75 M147.2 11.25 C147.17 17.69, 147.21 24.73, 147.2 33.75 M147.2 33.75 C145.47 41.9, 144.97 43.52, 135.95 45 M147.2 33.75 C146.67 41.13, 141.83 43.75, 135.95 45 M135.95 45 C103.8 47.84, 69.3 44.15, 11.25 45 M135.95 45 C93.22 45.15, 52.34 44.3, 11.25 45 M11.25 45 C5.69 46.22, -1.88 39.38, 0 33.75 M11.25 45 C2.02 44.31, -0.13 39.1, 0 33.75 M0 33.75 C1.52 29.46, -0.62 22.91, 0 11.25 M0 33.75 C-0.43 26.26, 0.29 18.15, 0 11.25 M0 11.25 C1.46 4.69, 4.91 -1.55, 11.25 0 M0 11.25 C-0.12 5.55, 2.49 1.78, 11.25 0" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g><g transform="translate(44.970008850097656 48.799972534179716) rotate(0 63.8299560546875 12.5)"><text x="63.8299560546875" y="17.619999999999997" font-family="Excalifont, Xiaolai, sans-serif, Segoe UI Emoji" font-size="20px" fill="#1e1e1e" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">@vue/compat</text></g><g stroke-linecap="round" transform="translate(35.19994354248047 93.94998931884768) rotate(0 73.60002136230469 22.5)"><path d="M11.25 0 C44.97 -0.91, 80.95 3.03, 135.95 0 C142.19 1.23, 145.33 5.16, 147.2 11.25 C144.7 18.65, 148.06 23.26, 147.2 33.75 C143.77 42.72, 142.37 48.29, 135.95 45 C86.24 43.08, 34.59 44.4, 11.25 45 C2.41 46.37, 2.65 40.96, 0 33.75 C2.25 25.71, -2.27 20.29, 0 11.25 C-1.88 3.07, 4.52 2.16, 11.25 0" stroke="none" stroke-width="0" fill="#ffc9c9"></path><path d="M11.25 0 C59.46 0.7, 107.37 -0.14, 135.95 0 M11.25 0 C58.74 -0.99, 107.29 -0.82, 135.95 0 M135.95 0 C144.84 0.95, 145.39 3.84, 147.2 11.25 M135.95 0 C141.66 0.46, 146.62 5.9, 147.2 11.25 M147.2 11.25 C147.06 15.22, 147.3 22.86, 147.2 33.75 M147.2 11.25 C147.7 18.98, 147.49 25.29, 147.2 33.75 M147.2 33.75 C147.68 42.08, 144.68 44.37, 135.95 45 M147.2 33.75 C145.71 41.68, 144.84 45.49, 135.95 45 M135.95 45 C111.75 45.46, 83.69 42.9, 11.25 45 M135.95 45 C97.09 44.57, 59.76 45.45, 11.25 45 M11.25 45 C2.66 45.59, 1.31 39.64, 0 33.75 M11.25 45 C2.92 42.97, 2.16 41.81, 0 33.75 M0 33.75 C-1.42 27.96, 0.55 25.07, 0 11.25 M0 33.75 C-0.13 26.19, 0.72 18.99, 0 11.25 M0 11.25 C0.68 5.62, 5.12 1.15, 11.25 0 M0 11.25 C-0.04 5.35, 1.59 -0.11, 11.25 0" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g><g transform="translate(60.209991455078125 103.94998931884768) rotate(0 48.58997344970703 12.5)"><text x="48.58997344970703" y="17.619999999999997" font-family="Excalifont, Xiaolai, sans-serif, Segoe UI Emoji" font-size="20px" fill="#1e1e1e" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">prototype</text></g><g stroke-linecap="round" transform="translate(35.19994354248047 149.10000610351565) rotate(0 73.60002136230469 30)"><path d="M15 0 C53.22 3.66, 88.02 2.66, 132.2 0 C142.43 -1.17, 145.96 3.96, 147.2 15 C150.02 23.31, 145.53 39.91, 147.2 45 C146.69 54.55, 140.33 62.48, 132.2 60 C109.01 59.77, 77.28 60.18, 15 60 C1.5 61, 3.46 55.68, 0 45 C1.46 34.85, -2.08 18.96, 0 15 C1.2 7.86, 7.29 -2.85, 15 0" stroke="none" stroke-width="0" fill="#ffc9c9"></path><path d="M15 0 C57.73 0.75, 99.84 0.99, 132.2 0 M15 0 C51.16 -0.13, 87.01 -1.55, 132.2 0 M132.2 0 C141.84 1.69, 148.7 6.83, 147.2 15 M132.2 0 C141.58 0.08, 148.6 4.42, 147.2 15 M147.2 15 C146.33 19.97, 145.7 28.09, 147.2 45 M147.2 15 C146.8 24.57, 147.92 34.65, 147.2 45 M147.2 45 C149.13 56.16, 143.99 61.1, 132.2 60 M147.2 45 C147.16 56.5, 142.78 57.76, 132.2 60 M132.2 60 C94.27 59.07, 54.92 59.86, 15 60 M132.2 60 C103.6 59.55, 75.32 60.42, 15 60 M15 60 C6.52 59.11, -0.78 53.5, 0 45 M15 60 C2.89 61.69, 0.61 55.79, 0 45 M0 45 C1.25 33.58, -1.62 21.91, 0 15 M0 45 C-0.85 38.69, 0.62 29.5, 0 15 M0 15 C1.96 5.96, 3.67 1.43, 15 0 M0 15 C-2.11 3.85, 5.69 -0.1, 15 0" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g><g transform="translate(54.970008850097656 154.10000610351565) rotate(0 53.8299560546875 25)"><text x="53.8299560546875" y="17.619999999999997" font-family="Excalifont, Xiaolai, sans-serif, Segoe UI Emoji" font-size="20px" fill="#1e1e1e" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">deprecated</text><text x="53.8299560546875" y="42.62" font-family="Excalifont, Xiaolai, sans-serif, Segoe UI Emoji" font-size="20px" fill="#1e1e1e" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">API</text></g><g stroke-linecap="round" transform="translate(211.1999053955078 132.29995727539065) rotate(0 73.60002136230469 22.5)"><path d="M11.25 0 C52.62 -1.57, 89.16 1.48, 135.95 0 C145.53 1.83, 146.24 6.73, 147.2 11.25 C147.31 16.85, 145.48 18.07, 147.2 33.75 C148.9 42.66, 146.62 48.55, 135.95 45 C100.45 45.49, 59.34 43.78, 11.25 45 C3.33 43.17, -2.45 40.52, 0 33.75 C0.68 29.95, 1.23 18.85, 0 11.25 C1 6.5, 5.12 -1.66, 11.25 0" stroke="none" stroke-width="0" fill="#b2f2bb"></path><path d="M11.25 0 C52.5 1.74, 91.53 1.49, 135.95 0 M11.25 0 C53.32 1.31, 93 0.44, 135.95 0 M135.95 0 C141.48 0.1, 149.03 4.52, 147.2 11.25 M135.95 0 C142.35 -0.72, 146.93 2.14, 147.2 11.25 M147.2 11.25 C146.19 15.51, 146.57 21.5, 147.2 33.75 M147.2 11.25 C148.11 19.44, 148.12 28.49, 147.2 33.75 M147.2 33.75 C147.67 42.7, 143.31 43.03, 135.95 45 M147.2 33.75 C147.77 39.15, 143.65 44.82, 135.95 45 M135.95 45 C107.16 43.26, 79.99 43.61, 11.25 45 M135.95 45 C89.2 44.57, 44.6 45.56, 11.25 45 M11.25 45 C3.3 46.28, -1.93 39.92, 0 33.75 M11.25 45 C1.83 45.3, 1.15 40.22, 0 33.75 M0 33.75 C-2 25.3, -1.29 21.25, 0 11.25 M0 33.75 C-0.76 26.63, -0.1 19.47, 0 11.25 M0 11.25 C-0.01 3.65, 5.41 -0.25, 11.25 0 M0 11.25 C-0.85 3.05, 5.53 0.88, 11.25 0" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g><g transform="translate(262.6199417114258 142.29995727539065) rotate(0 22.17998504638672 12.5)"><text x="22.17998504638672" y="17.619999999999997" font-family="Excalifont, Xiaolai, sans-serif, Segoe UI Emoji" font-size="20px" fill="#1e1e1e" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">Vuex</text></g><g stroke-linecap="round" transform="translate(209.59999084472656 65.09992980957034) rotate(0 73.60002136230469 22.5)"><path d="M11.25 0 C43.54 -0.52, 67.3 1.39, 135.95 0 C146.14 -1.37, 150.44 5.97, 147.2 11.25 C145.27 20.61, 146.81 25.13, 147.2 33.75 C148.04 44.14, 140.11 47.56, 135.95 45 C96.13 43.04, 53.39 44.45, 11.25 45 C4.48 43.7, -1.61 38.87, 0 33.75 C0.83 24.67, -1.22 19.39, 0 11.25 C-2.51 5.23, 1.67 -1.99, 11.25 0" stroke="none" stroke-width="0" fill="#b2f2bb"></path><path d="M11.25 0 C42.67 -1.46, 77.09 -0.31, 135.95 0 M11.25 0 C59.27 0.34, 108.41 0.39, 135.95 0 M135.95 0 C144.4 1.71, 145.47 2.44, 147.2 11.25 M135.95 0 C145.02 -1.9, 148.12 3.97, 147.2 11.25 M147.2 11.25 C148.95 19.47, 145.27 26.38, 147.2 33.75 M147.2 11.25 C146.69 20.1, 147.06 27.65, 147.2 33.75 M147.2 33.75 C147.18 42.15, 144.41 44.77, 135.95 45 M147.2 33.75 C146.69 43.11, 142.48 43.45, 135.95 45 M135.95 45 C85.56 45.91, 37.2 43.56, 11.25 45 M135.95 45 C92.07 45.97, 49.05 46.13, 11.25 45 M11.25 45 C5.43 45.79, -0.62 42.49, 0 33.75 M11.25 45 C4.58 45.73, -0.3 40.16, 0 33.75 M0 33.75 C0.26 25.03, -1.52 18.58, 0 11.25 M0 33.75 C0.06 25.27, 0.28 16.83, 0 11.25 M0 11.25 C1.33 4.57, 2.36 0.02, 11.25 0 M0 11.25 C1.95 2.42, 2.68 -1.81, 11.25 0" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g><g transform="translate(232.2000503540039 75.09992980957034) rotate(0 50.999961853027344 12.5)"><text x="50.999961853027344" y="17.619999999999997" font-family="Excalifont, Xiaolai, sans-serif, Segoe UI Emoji" font-size="20px" fill="#1e1e1e" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">Vue-router</text></g><g stroke-linecap="round" transform="translate(380.8000030517578 62.6999206542969) rotate(0 73.60002136230469 22.5)"><path d="M11.25 0 C55.3 -0.41, 105.19 -3.03, 135.95 0 C142.55 -3.56, 150 4.53, 147.2 11.25 C147.6 18.45, 143.92 25.65, 147.2 33.75 C144.09 39.97, 142.65 43.32, 135.95 45 C98.37 46.17, 64.57 48.76, 11.25 45 C2.84 48.45, -3.01 40.41, 0 33.75 C0.47 24.43, -1.94 18.17, 0 11.25 C1.65 0.67, 1.41 0.05, 11.25 0" stroke="none" stroke-width="0" fill="#b2f2bb"></path><path d="M11.25 0 C50.67 1.27, 88.48 2.05, 135.95 0 M11.25 0 C50.53 0.33, 91.79 -0.03, 135.95 0 M135.95 0 C144.06 -1.58, 146.67 2.71, 147.2 11.25 M135.95 0 C141.85 0.95, 145.87 2.48, 147.2 11.25 M147.2 11.25 C148.76 20.36, 147.77 28.89, 147.2 33.75 M147.2 11.25 C146.8 16.92, 148 23.83, 147.2 33.75 M147.2 33.75 C148.35 43.24, 141.66 45.47, 135.95 45 M147.2 33.75 C149.17 42.92, 141.61 45.53, 135.95 45 M135.95 45 C106.68 46.66, 75.36 45.23, 11.25 45 M135.95 45 C106.48 43.92, 74.64 43.58, 11.25 45 M11.25 45 C4.08 45.77, -1.17 42.35, 0 33.75 M11.25 45 C5.87 42.8, 2.06 42.46, 0 33.75 M0 33.75 C-1.5 25.48, 1.81 18.96, 0 11.25 M0 33.75 C0.34 26.2, -0.05 19.93, 0 11.25 M0 11.25 C0.4 2.45, 5.72 -1.3, 11.25 0 M0 11.25 C2.22 5.49, 4.01 1.72, 11.25 0" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g><g transform="translate(432.43003845214844 72.6999206542969) rotate(0 21.969985961914062 12.5)"><text x="21.969985961914062" y="17.619999999999997" font-family="Excalifont, Xiaolai, sans-serif, Segoe UI Emoji" font-size="20px" fill="#1e1e1e" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">Vant</text></g><g stroke-linecap="round" transform="translate(383.99989318847656 132.69995117187503) rotate(0 73.60002136230469 22.5)"><path d="M11.25 0 C42.47 -2.09, 72.54 -2.13, 135.95 0 C145.48 -2.64, 150.72 0.28, 147.2 11.25 C149.44 15.56, 143.83 22.8, 147.2 33.75 C147.09 44.05, 142.54 43.23, 135.95 45 C104.01 45, 71.7 42.16, 11.25 45 C4.31 41.73, -0.61 43.29, 0 33.75 C-1.74 25.73, 1.97 19.59, 0 11.25 C-0.69 1.44, 2.29 -1.41, 11.25 0" stroke="none" stroke-width="0" fill="#b2f2bb"></path><path d="M11.25 0 C56.9 1.07, 103.27 1.22, 135.95 0 M11.25 0 C54.89 1.08, 98.9 0.82, 135.95 0 M135.95 0 C143.11 0.73, 147.47 5.01, 147.2 11.25 M135.95 0 C142.24 1.64, 147.66 2.95, 147.2 11.25 M147.2 11.25 C148.83 19.87, 146.24 27.14, 147.2 33.75 M147.2 11.25 C146.73 17.92, 148.08 23.36, 147.2 33.75 M147.2 33.75 C148.69 40.95, 144.2 46.87, 135.95 45 M147.2 33.75 C146.4 39.92, 141.37 47.17, 135.95 45 M135.95 45 C98.78 46.82, 64.06 47.83, 11.25 45 M135.95 45 C103.97 44.96, 69.83 44.33, 11.25 45 M11.25 45 C4.59 45.44, -0.39 40.16, 0 33.75 M11.25 45 C3.26 45.56, -0.06 42.22, 0 33.75 M0 33.75 C-1.09 26.93, -1.22 18.51, 0 11.25 M0 33.75 C-0.8 25.06, -0.94 18.85, 0 11.25 M0 11.25 C0.26 5.11, 4.43 0.75, 11.25 0 M0 11.25 C-1.3 5.79, 3.71 1.92, 11.25 0" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g><g transform="translate(449.37992095947266 142.69995117187503) rotate(0 8.219993591308594 12.5)"><text x="8.219993591308594" y="17.619999999999997" font-family="Excalifont, Xiaolai, sans-serif, Segoe UI Emoji" font-size="20px" fill="#1e1e1e" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">...</text></g><g stroke-linecap="round" transform="translate(10 242.79985046386722) rotate(0 272.800048828125 108.39999389648438)"><path d="M32 0 C194.22 3.63, 359.46 4.14, 513.6 0 C537.14 -0.57, 544.19 11.4, 545.6 32 C542.52 64.61, 545.23 98.47, 545.6 184.8 C545.63 208.35, 532.14 215.55, 513.6 216.8 C354.33 214.15, 197.34 215.11, 32 216.8 C12.16 213.95, 3.24 205.59, 0 184.8 C0.79 147.81, 1.19 113.83, 0 32 C0.01 10.28, 12.36 1.63, 32 0" stroke="none" stroke-width="0" fill="#a5d8ff"></path><path d="M32 0 C136.86 -1.21, 241.85 -0.06, 513.6 0 M32 0 C165.73 -1.16, 299.14 -1.19, 513.6 0 M513.6 0 C536.32 0.42, 547.3 10, 545.6 32 M513.6 0 C535.46 2.14, 543.48 10.51, 545.6 32 M545.6 32 C544.23 93.18, 547.82 154.44, 545.6 184.8 M545.6 32 C547.93 92.99, 547.59 152.54, 545.6 184.8 M545.6 184.8 C546.62 204.56, 534.1 216.16, 513.6 216.8 M545.6 184.8 C545 206.35, 536.77 216.34, 513.6 216.8 M513.6 216.8 C382.74 218.12, 252.32 218.45, 32 216.8 M513.6 216.8 C387.8 215.78, 261.69 215.18, 32 216.8 M32 216.8 C9.9 215.94, 0.63 208.1, 0 184.8 M32 216.8 C11.11 218.12, -1.76 206.16, 0 184.8 M0 184.8 C0.59 150.73, 3.28 114.51, 0 32 M0 184.8 C0.3 140.31, 1.73 95.63, 0 32 M0 32 C1.11 9.45, 10.27 -0.83, 32 0 M0 32 C0.19 8.97, 8.68 0.71, 32 0" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g><g stroke-linecap="round" transform="translate(41.599945068359375 265.59998321533203) rotate(0 240.79998779296875 38.400001525878906)"><path d="M19.2 0 C151.77 -3.68, 284.95 -2.81, 462.4 0 C476 1.01, 478.37 3.27, 481.6 19.2 C482.72 31.37, 483.86 43.17, 481.6 57.6 C482.63 70.53, 472.19 76.27, 462.4 76.8 C294.69 78.01, 125.01 78.41, 19.2 76.8 C8.15 77.16, -2.25 67.82, 0 57.6 C-1.57 43.39, 0.49 32.1, 0 19.2 C0.19 3.46, 3.57 -1.14, 19.2 0" stroke="none" stroke-width="0" fill="#fcc2d7"></path><path d="M19.2 0 C155.25 2.65, 291.59 1.92, 462.4 0 M19.2 0 C164.76 -1.02, 310.14 -1.76, 462.4 0 M462.4 0 C475.03 -1.37, 481 8.4, 481.6 19.2 M462.4 0 C475.51 -0.1, 481.89 7.09, 481.6 19.2 M481.6 19.2 C482.3 26.9, 479.77 35.2, 481.6 57.6 M481.6 19.2 C482.15 35.29, 482 50.04, 481.6 57.6 M481.6 57.6 C483.24 70.16, 473.58 77.43, 462.4 76.8 M481.6 57.6 C481.61 71.08, 476.54 77.48, 462.4 76.8 M462.4 76.8 C348.23 77.14, 233.38 78.03, 19.2 76.8 M462.4 76.8 C365.63 77.76, 270.25 77.33, 19.2 76.8 M19.2 76.8 C7.36 75.92, 1.17 70.35, 0 57.6 M19.2 76.8 C6.46 76.88, -1.28 70.77, 0 57.6 M0 57.6 C0 43.46, -0.14 32.27, 0 19.2 M0 57.6 C0.29 44.25, -0.13 33.51, 0 19.2 M0 19.2 C-1.18 4.8, 5.01 -0.89, 19.2 0 M0 19.2 C-1.15 6.42, 6.05 -1.09, 19.2 0" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g><g transform="translate(75.17010498046875 291.49998474121094) rotate(0 207.22982788085938 12.5)"><text x="207.22982788085938" y="17.619999999999997" font-family="Excalifont, Xiaolai, sans-serif, Segoe UI Emoji" font-size="20px" fill="#1e1e1e" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">vue-template-compiler -&gt; @vue/compiler-sfc</text></g><g stroke-linecap="round" transform="translate(42.399932861328125 363.19995880126953) rotate(0 240.40011596679688 36.79999542236328)"><path d="M18.4 0 C121.52 4, 223.1 2.22, 462.4 0 C477.36 -2.24, 480.51 6.73, 480.8 18.4 C482.4 30.72, 483.51 37.96, 480.8 55.2 C477.32 64.4, 474.75 77.2, 462.4 73.6 C362.65 75.24, 258.22 76.41, 18.4 73.6 C7.74 71.85, 1.79 70.43, 0 55.2 C3.54 40.7, -2.45 33.3, 0 18.4 C1.17 8.27, 6.87 -1.23, 18.4 0" stroke="none" stroke-width="0" fill="#fcc2d7"></path><path d="M18.4 0 C145.5 0.28, 272.86 -0.45, 462.4 0 M18.4 0 C110.18 -1.48, 201.92 -1.43, 462.4 0 M462.4 0 C476.03 -1.58, 481.74 4.24, 480.8 18.4 M462.4 0 C473.48 2.2, 482.27 7.09, 480.8 18.4 M480.8 18.4 C480.78 31.67, 480.58 46.19, 480.8 55.2 M480.8 18.4 C481.42 32.27, 480.39 45.02, 480.8 55.2 M480.8 55.2 C481.84 67.56, 475.54 73.74, 462.4 73.6 M480.8 55.2 C479.28 68.07, 474 73.18, 462.4 73.6 M462.4 73.6 C335.48 73.21, 209.38 72.85, 18.4 73.6 M462.4 73.6 C339.05 71.35, 215.83 71.74, 18.4 73.6 M18.4 73.6 C7.95 74.11, 0.62 68.98, 0 55.2 M18.4 73.6 C4.43 71.63, -0.61 69.52, 0 55.2 M0 55.2 C-1.73 42.89, 0.54 31.21, 0 18.4 M0 55.2 C0.86 45.18, 0.92 35.69, 0 18.4 M0 18.4 C0.11 4.95, 4.32 0.02, 18.4 0 M0 18.4 C-2.2 4.63, 6.72 1.81, 18.4 0" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g><g transform="translate(215.82009887695312 387.4999542236328) rotate(0 66.97994995117188 12.5)"><text x="66.97994995117188" y="17.619999999999997" font-family="Excalifont, Xiaolai, sans-serif, Segoe UI Emoji" font-size="20px" fill="#1e1e1e" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">Vue-cli -&gt; Vite</text></g></svg>

## 升级步骤

[官方升级手册]([Migration Build | Vue 3 Migration Guide](https://v3-migration.vuejs.org/migration-build.html))已经写得很详细了，核心在于：
1. @vue/compiler-sfc 替换 vue-template-compiler 包
2. vue 包从 v2 升级到 v3
3. 安装@vue/compat
4. 升级插件到支持 Vue 3 的版本，比如 Vue-Router、Vuex 等

```json
{
	"dependencies": {
	-  "vue": "^2.6.12",
	+  "vue": "^3.1.0",
	+  "@vue/compat": "^3.1.0"
	   ...
	},
	"devDependencies": {
	-  "vue-template-compiler": "^2.6.12"
	+  "@vue/compiler-sfc": "^3.1.0"
	}
}
```

之后通过构建工具，将对 vue 的导入改为 @vue/compat，这可以通过别名来实现，以 vue-cli 为例

```js
// vue.config.js
module.exports = {
  chainWebpack: (config) => {
    config.resolve.alias.set('vue', '@vue/compat')
	config.resolve.alias.set('vue3', 'vue') // 允许指向真正的vue3

    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        return {
          ...options,
          compilerOptions: {
            compatConfig: {
              MODE: 2
            }
          }
        }
      })
  }
}
```

@vue/compat 提供了一个兼容层，相当于在 vue3 环境下实现了 vue2 的 polyfill，它使得在 vue3 环境下，也能使用 vue2 中的语法。

此外，还需要注意的是这三个包版本需要保持一致，官方推荐 v3.1.0，但是据笔者实践，3.1.0 这个版本 bug 非常多，建议统一升级到 3.2.x 或更高的稳定版本（如**v 3.2.47**）。

如果使用的是 vue-cli，还需要执行 vue upgrade 升级 vue-cli 版本，或者手动将 package. json 中这几个包升级版本：
```json
{
	"@vue/cli-plugin-babel": "^5.0.9",
	"@vue/cli-plugin-eslint": "^5.0.9",
	"@vue/cli-plugin-router": "^5.0.9",
	"@vue/cli-service": "^5.0.9",
}
```

经过上面操作后，项目应该能够正常跑起来，终端中应该会有很多警告，但是不影响项目启动，接下来只要参考 Vue 3 具体变更逐步修改即可，具体变更内容可以参考[官方文档]([Breaking Changes | Vue 3 Migration Guide](https://v3-migration.vuejs.org/breaking-changes/))，重点关注 **Removed APIs** 这部分。

## 说明和建议

### Vue版本推荐

不建议使用官方文档使用的 **v3.1.0** 版本， 3.2.x 或更高的稳定版本，相较前者更加稳定，bug 更少。`vue` 和 `@vue/compat` 等包强烈推荐使用统一版本。

### @vue/compat
#### 配置
@vue/compat 为从 Vue 2 升级到 Vue 3 过程提供兼容层，兼容 Vue 2 中被废弃的 API，**可以通过MODE**配置执行行为，支持以下值：
- **1**：静默模式 - 兼容但不警告
- **2**：警告模式 - 兼容但显示警告（推荐迁移期使用）
- **3**：严格模式 - 不兼容，直接报错（用于后期验证）

此外也可以指定单独特性是否启动兼容，这可以和 **MODE**搭配使用，比如说：

```js
import { configureCompat } from '@vue/compat'
configureCompat({
  MODE: 3,
  GLOBAL_MOUNT: true // 兼容 new Vue语法
})
```

在这个配置下，默认使用 Vue3 特性，但是启动兼容 `new Vue` 语法（GLOBAL_MOUNT）。

此外@vue/compat 还支持组件级配置，比如：

```js
export default {
  compatConfig: {
    MODE: 3, // 默认Vue3
    FEATURE_ID_A: true, // 某个特性
  },
  // ...
}
```
#### 限制
@vue/compat也有一些限制，具体如下：

1. 如果老代码有使用到 vue 2 内部未公开的 API，比如 vnode，则可能出问题
2. 不支持 IE 11，因为 Vue 3 已经放弃对 IE 的支持
3. 不建议用于 SSR 的升级，SSR 建议使用 Nuxt

### npm 包

vue 官方包基本都设置了 `peerDependencies` 来约束版本，因此你安装时可能遇到过这种报错：

```
npm error Found: vue-router@4.0.0
npm error node_modules/vue-router
npm error   vue-router@"4.6.4" from the root project
npm error
npm error Could not resolve dependency:
npm error vue-router@"4.6.4" from the root project
npm error
npm error Conflicting peer dependency: vue@3.5.26
npm error node_modules/vue
npm error   peer vue@"^3.5.0" from vue-router@4.6.4
npm error   node_modules/vue-router
npm error     vue-router@"4.6.4" from the root project
npm error
npm error Fix the upstream dependency conflict, or retry
npm error this command with --force or --legacy-peer-deps
npm error to accept an incorrect (and potentially broken) dependency resolution.
```

这是因为我本地安装的 vue 版本较低，而现在安装的 ` vue-router` 版本过高导致的，版本不对可能会导致冲突。

不建议使用 `npm i --force` 等方式绕过，建议按照说明调整你安装的版本，避免导致版本冲突，比如尝试 `npm i -S vue-router@4.2` 进行降级或者对 `vue` 进行升级。
### Vue. prototype

在Vue 2，Vue 是一个全局共享的类，由于 JS类的原型链机制，我们可以向这个类的原型对象上挂载各种方法，比如：

```js
Vue.prototype.$http = axios

// 使用
this.$http.post
```

这是 vue2 中非常常见的做法，甚至 vue-router、vuex 这些插件过去也是这样做的，但是在 vue 3 中，`new Vue` 被改为 `createApp`，不再暴露 Vue 类，这有利于实现状态隔离，但是对于老语法修改起来工作量比较大，有一个技巧可以快速实现渐进式修改。

```js
// Vue2
// Vue.prototype.$axios = request
// Vue.prototype.$utils = utils
// Vue.prototype.$toast = Toast

// Vue3 临时处理
globalThis.$utils = utils
globalThis.$toast = Toast
globalThis.$axios = request
globalThis.$router = router
globalThis.$route = $router.currentRoute
```

思路是先将所有之前挂载原型上的方法，挂载到全局对象上（window），然后全局代码替换（vscode 等编辑器都支持），比如 `this.$axios` 替换为 `$axios`，这样能够保证以非常小的修改量让代码先跑起来，然后借助 eslint 的来实现警告，在后续逐渐将全局变量改为局部导入。
### Vue-router

Vue-Router 相较于老版本的调整具体可以见[官方说明](https://router.vuejs.org/zh/guide/migration/)，下面重点讲几个容易被忽视的点。

#### 布尔值不会被自动解析

在老版本，'? a=false'会被自动解析成布尔值，但是新版本不会再自动处理，因此判断逻辑需要调整。

```js
!this.$route.query.a  // 不建议
this.$route.query.a === 'true' // 推荐
```

## 集成 Vite（可选）

### 步骤

首先安装 `vite` , 如果只是想在 vite 中使用 vue 2，那么可以安装 `vite-plugin-vue2` 来支持 vue 2 的 SFC 的解析，但是我们这是将 vue 2 升级到 vue 3，因此需要安装 `@vitejs/plugin-vue`。
```
npm i -D vite @vitejs/plugin-vue
```

之后在根路径下新建 `vue.config.js` 文件，并将 `webpack/vue-cli` 配置迁移, 可以参考下面配置。

```js
import { defineConfig } from 'vite'
import path from 'node:path'
import vue from '@vitejs/plugin-vue'

const __dirname = import.meta.dirname

export default defineConfig({
  base: '/h5/', // 访问路径前缀
  define: {
    'process.env': {},
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          compatConfig: {
            MODE: 2, // 兼容vue2语法，警告级别
          },
        },
      },
    }),
  ],
  server: {
    port: 8086,
    proxy: {
      // 代理，按照实际的配置，和vue-cli配置差不多
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
    alias: {
      '@': path.join(__dirname, './src'),
      '@api': path.join(__dirname, './src/api'),
      '@assets': path.join(__dirname, './src/assets'),
      '@components': path.join(__dirname, './src/components'),
      '@store': path.join(__dirname, './src/store'),
      '@utils': path.join(__dirname, './src/utils'),

      // vue: '@vue/compat', // 兼容vue2，但是当你vue和插件都升级到vue3版本时，建议删除别名，否则可能会干扰vue3的正常运行
    },
  },
})

```

接下来需要处理入口 html，和 webpack 不同的是，vite 的入口 html 在项目根目录，此外还需要注意下面几点：
1. 替换 webpack 插值模板语法。
2. 用'/'替换'/public/'路径
3. 添加 `<script type="module" src="/src/你的入口文件.js"></script>` 引入入口 js 文件

参考示例
```html
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="width=device-width,user-scalable=no,initial-scale=1" name="viewport">
    <link rel="icon" href="<%= BASE_URL %>favicon.ico">
    <title><%= htmlWebpackPlugin.options.title %></title>
  </head>
  <body>
    <noscript>
      <strong>We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
    </noscript>
    <div id="app"></div>
    <!-- built files will be auto injected -->
  </body>
</html>

```

替换成 Vite 支持的格式

```html
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="width=device-width,user-scalable=no,initial-scale=1" name="viewport">
    <link rel="icon" href="/favicon.ico">
    <title>title</title>
  </head>
  <body>
    <noscript>
      <strong>We're sorry but doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
    </noscript>
    <div id="app"></div>
    <!-- built files will be auto injected -->
     <script type="module" src="./src/main.js"></script>
  </body>
</html>

```

接下来需要全局处理下面几点
- 由于 vite 和 webpack 对公共资源路径处理规则不同，因此需要将所有的'/public/xx'改成'/xx'
-  将 `process` 改成 `import`

例如：
```js
- export default process.env.VUE_ENV === 'server' // 删除
+ export default import.meta.env.SSR  // 新增
```

最后，修改 `package. json` 的 `script` 脚本命令。

```json
"dev": "vite",
"build": "vite build"
```

启动测试无误后，删除 ` vue-cli` 相关的包。

### 问题记录

在配置完毕启动后，出现异常报错：

```js
Uncaught ReferenceError: exports is not defined at vue-router.esm-bundler.js:2306:23
```

从报错中分析：exports 很明显是 Commonjs 的导出语句，由于 Vite 底层基于 ESM 实现预构建，可能是某些配置与其产生冲突，因此按照下面步骤操作：
1. `package.json` 配置 `"type": "module"`
2. `tsconfig. json` 的 `target` 配置项配置成 es 格式（如 `esnext`）
3. 删除` node_module/. cache`中的webpack 缓存
然而重启后仍然报错，怀疑是包本身的问题，升级版本
```
npm i -S vue-router@4.2.0
```

升级后，问题解决。

### 建议（可选）

vite 本身依赖 ESM ，因此建议项目 `package.json` 配置 `"type": "module"`, 同时将 `tsconfig. json` 的 `target` 配置项配置成 es 格式（如 `esnext`）。