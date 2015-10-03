<!DOCTYPE html>
<html ng-app="parcelMan">
    <head>

        <meta charset="utf8">
        <!--
        This block is specifically for the Favicon & Homescreen Icon (Android, iOS and Windows Phone) -->
        <link rel="apple-touch-icon" sizes="57x57" href="static/img/favicon/apple-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60" href="static/img/favicon/apple-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72" href="static/img/favicon/apple-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76" href="static/img/favicon/apple-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="static/img/favicon/apple-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="static/img/favicon/apple-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="static/img/favicon/apple-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="static/img/favicon/apple-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="180x180" href="static/img/favicon/apple-icon-180x180.png">
        <link rel="icon" type="image/png" sizes="192x192"  href="static/img/favicon/android-icon-192x192.png">
        <link rel="icon" type="image/png" sizes="32x32" href="static/img/favicon/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="96x96" href="static/img/favicon/favicon-96x96.png">
        <link rel="icon" type="image/png" sizes="16x16" href="static/img/favicon/favicon-16x16.png">
        <link rel="manifest" href="/manifest.json">
        <meta name="msapplication-TileColor" content="#ffffff">
        <meta name="msapplication-TileImage" content="static/img/favicon/ms-icon-144x144.png">
        <meta name="theme-color" content="#ffffff">

        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Parcelman">

        <title>Parcelman &mdash; A Simple Parcel Manager</title>

        <link rel="stylesheet" type="text/css" href="static/css/parcelman.css">

    </head>
    <body>
        <nav class="navbar navbar-dark bg-inverse">
            <div class="container">
                <a class="navbar-brand" href="#/">
                    <span class="text-muted font-porter">PARCELMAN</span>
                </a>
                <ul class="nav navbar-nav pull-right">
                    <li class="nav-item" ng-if="currentPath != '/dashboard' && loggedIn">
                        <a class="nav-link" href="#/dashboard">Dashboard</a>
                    </li>
                    <li class="nav-item">
                        <span ng-switch="loggedIn">
                            <a ng-switch-when="true" class="nav-link" ng-click="logout()"><span class="pmicon pm-power"></span> Logout</a>
                            <a ng-switch-default class="nav-link" ng-click="showLoginForm()"><span class="pmicon pm-lock"></span> Login</a>
                        </span>
                    </li>
                </ul>
            </div>
        </nav>

        <div class="content" ng-view></div>

        <footer>
            <div class="container text-center">
                Copyright &copy; 2015 Parcelman Sdn Bhd.
            </div>
        </footer>

        <script src="static/js/min/compiled_libraries-min.js"></script>
        <script src="static/js/_app.js"></script>
        <script src="static/js/_controllers.js"></script>
        <script src="static/js/_directives.js"></script>
    </body>
</html>