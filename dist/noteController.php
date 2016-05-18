<?php

/**
* Class PostItAll : note controller
* @author Javi Filella <postitall@txusko.com>
*/
class PostItAll
{
    //DB Configuration
    private $db_host        = "127.0.0.1";
    private $db_user        = "root";
    private $db_password    = "";
    private $db_database    = "test";
    private $db_port        = "3306";
    private $mysqli         = null;

    //Public properties
    public $iduser          = -1;
    public $option          = "";
    public $key             = "";
    public $content         = "";

    /**
	 *  Class constructor
	 */
    function __construct() {
    	//Cors for the gh-page example
        $this->cors("http://postitall.txusko.com");

        //Connection
        $this->mysqli = mysqli_connect($this->db_host, $this->db_user, $this->db_password, $this->db_database, $this->db_port) or die("Error " . mysqli_error($link));

        //Create table
        $this->createTable() or die("Table creation error " . mysqli_error($link));
    }

    /**
	 *  Class destructor
	 */
    function __destruct() {
        //Close connection
        $this->mysqli->close();
    }

    /**
	 *  An example CORS-compliant method.  It will allow any GET, POST, or OPTIONS requests from any
	 *  origin.
	 *
	 *  In a production environment, you probably want to be more restrictive, but this gives you
	 *  the general idea of what is involved.  For the nitty-gritty low-down, read:
	 *
	 *  - https://developer.mozilla.org/en/HTTP_access_control
	 *  - http://www.w3.org/TR/cors/
	 *
	 */
    private function cors($server_url) {
	    // Allow from any origin
	    if (isset($_SERVER['HTTP_ORIGIN'])) {
	        header("Access-Control-Allow-Origin: {$server_url}");
	        header('Access-Control-Allow-Credentials: true');
	        header('Access-Control-Max-Age: 86400');    // cache for 1 day
	    }

	    // Access-Control headers are received during OPTIONS requests
	    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

	        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
	            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

	        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
	            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

	        exit(0);
	    }
	}

    /**
	 *  Parse request method
	 */
    private function getRequest() {
        //Option
        $this->option = "";
        if(isset($_REQUEST["option"]) && $_REQUEST["option"]) {
            $this->option = mysqli_escape_string($this->mysqli, $_REQUEST["option"]);
        }
        //Iduser
        $this->iduser = -1;
        if(isset($_REQUEST["iduser"]) && $_REQUEST["iduser"]) {
            $this->iduser = mysqli_escape_string($this->mysqli, $_REQUEST["iduser"]);
        }
        //Key
        $this->key = "";
        if(isset($_REQUEST["key"]) && $_REQUEST["key"]) {
            $this->key = mysqli_escape_string($this->mysqli, $_REQUEST["key"]);
        }
        //Content
        $this->content = "";
        if(isset($_REQUEST["content"]) && $_REQUEST["content"]) {
            $this->content = mysqli_escape_string($this->mysqli, $_REQUEST["content"]);
        }
    }

    /**
	 *  Create DB structure
	 */
    private function createTable() {
        $createdb = "CREATE TABLE IF NOT EXISTS `postitall` (
                      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
                      `iduser` varchar(50) NOT NULL DEFAULT '',
                      `idnote` varchar(50) NOT NULL,
                      `content` text,
                      PRIMARY KEY (`id`)
                  ) ENGINE=MyISAM DEFAULT CHARSET=utf8;";
        return $this->mysqli->query($createdb);
    }

    /**
	 *  Main method
	 */
    public function main() {
        $error = false;
        $ret = "";

        //Get Request
        $this->getRequest();

        header('Content-Type: application/json');

        switch ($this->option) {

            case 'test':
                if($this->mysqli != null) {
                    $ret = "test ok";
                } else {
                    $error = true;
                    $ret = "test ko";
                }
                break;

            case 'getlength':
                $ret = $this->getLength($this->iduser);
                break;

            case 'get':
                $ret = $this->get($this->iduser, $this->key);
                break;

            case 'add':
                if(!$this->add($this->iduser, $this->key, $this->content))
                    $ret = "Error saving note";
                break;

            case 'key':
                $ret = $this->key($this->iduser, $this->key);
                break;

            case 'remove':
                $ret = $this->removeNote($this->iduser, $this->key);
                break;

            default:
                $error = true;
                $ret = "Option ".$this->option." not implemented";
                break;
        }

        if($error) {
            echo json_encode(array('status' => 'error', 'message'=> $ret));
        } else {
            echo json_encode(array('status' => 'success', 'message'=> $ret));
        }
    }

    /**
	 *  Get number of notes
	 */
    protected function getLength($idUser) {
        $sql = "select count(*) as total from postitall where iduser='" . $idUser . "'";
        $resultado = $this->mysqli->query($sql);
        $array = $resultado->fetch_array();
        return intval($array["total"]);
    }

    /**
	 *  Get a specific note
	 */
    protected function get($idUser, $idNote) {
        $sql = "select content from postitall where iduser='" . $idUser . "' and idnote='" . $idNote . "'";
        $resultado = $this->mysqli->query($sql);
        $array = $resultado->fetch_array();
        return $array["content"];
    }

    /**
	 *  Add a note in the DB
	 */
    protected function add($idUser, $idNote, $content) {
        return $this->save($idUser, $idNote, $content);
    }

    /**
	 *  Check if a note exists
	 */
    protected function exists($idUser, $idNote) {
        if($this->get($idUser, $idNote)) {
            return true;
        }
        return false;
    }

    /**
	 *  Get idnote
	 */
    protected function key($idUser, $key) {
        if(!$key) $key = "0";
        $sql = "select idnote from postitall where iduser='" . $idUser . "' limit " . $key . ",1";
        if($resultado = $this->mysqli->query($sql)) {
            $array = $resultado->fetch_array();
            return $array["idnote"];
        }
        return "";
    }

    /**
	 *  Save (insert or update) note to DB
	 */
    protected function save($idUser, $idNote, $content)
    {
        //$json = json_decode($content);
        //if (json_last_error() === JSON_ERROR_NONE) {
            if($this->get($idUser, $idNote))
                return $this->updateNote($idUser, $idNote, $content);
            else
                return $this->insertNote($idUser, $idNote, $content);
        //} else {
        //    return false;
        //}
    }

    /**
	 *  Insert note
	 */
    private function insertNote($idUser, $idNote, $content) {
        $sql = "insert into postitall (iduser, idnote, content) values ('".$idUser."','".$idNote."','".$content."')";
        return $this->mysqli->query($sql);
    }

    /**
	 *  Update note
	 */
    private function updateNote($idUser, $idNote, $content) {
        $sql = "update postitall set content='".$content."' where iduser='".$idUser."' and idNote='".$idNote."'";
        return $this->mysqli->query($sql);
    }

    /**
	 *  Delete note
	 */
    private function removeNote($idUser, $idNote) {
        $sql = "delete from postitall where iduser='".$idUser."' and idNote='".$idNote."'";
        return $this->mysqli->query($sql);
    }
}

if(!isset($_REQUEST["option"]) || !$_REQUEST["option"]) {
    die("No option");
}
$pia = new PostItAll();
echo $pia->main();
