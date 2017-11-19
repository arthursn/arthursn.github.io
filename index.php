<!DOCTYPE html>
<meta charset="utf-8">
<html>
<head>
<title>Miscellaneous</title>
<style type="text/css">
body {
    font-family: sans-serif;
    font-size: 20px;
}
a {
    color: #000;
    text-decoration: none;
}
a:hover {
    text-decoration: underline;
}
ul.pageslist {
    list-style-type: circle;
}

.container {
    margin: 0 auto;
}
@media (min-width: 1200px) {
    .container {
        width: 1170px;
    }
}
@media (min-width: 992px) {
    .container {
        width: 970px;
    }
}
@media (min-width: 768px) {
    .container {
        width: 750px;
    }
}
</style>
</head>
<body>
    <div class="container">
        <h1>Miscellaneous</h1>
        <ul class="pageslist">
            <?php
            $pageslist = "";
            foreach(glob("*.html") as $filename) {
                $pageslist .= "<li><a href='".$filename."'>".$filename."</a></li>\n";
            }
            echo $pageslist;
            ?>
        </ul>
    </div>
</body>
</html>