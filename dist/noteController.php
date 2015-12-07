<?php

class PostItAll
{
	//DB Configuration
	private $db_host 		= "127.0.0.1";
	private $db_user 		= "root";
	private $db_password 	= "";
	private $db_database	= "test";
	private $db_port		= "3306";
	private $mysqli 		= null;

	public $iduser 	= -1;
	public $option 	= "";
    public $key     = "";
	public $content = "";

	function __construct() {
		//Connection
		$this->mysqli = mysqli_connect($this->db_host, $this->db_user, $this->db_password, $this->db_database, $this->db_port) or die("Error " . mysqli_error($link));

		//Create table
		$this->createTable() or die("Table creation error " . mysqli_error($link));
    }


    function __destruct() {
        //Close connection
		$this->mysqli->close();
    }

    private function getRequest() {
		//Option
		if(!isset($_REQUEST["option"]) || !$_REQUEST["option"])
			die("No option");
		$this->option = mysqli_escape_string($this->mysqli, $_REQUEST["option"]);
		//Id user
		$this->iduser = -1;
		if(isset($_REQUEST["iduser"]) && $_REQUEST["iduser"])
			$this->iduser = mysqli_escape_string($this->mysqli, $_REQUEST["iduser"]);
        //Content
        $this->key = "";
        if(isset($_REQUEST["key"]) && $_REQUEST["key"])
            $this->key = mysqli_escape_string($this->mysqli, $_REQUEST["key"]);
        //Content
		$this->content = "";
		if(isset($_REQUEST["content"]) && $_REQUEST["content"]) {
			$this->content = mysqli_escape_string($this->mysqli, $_REQUEST["content"]);
        }
    }

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

   	public function main() {
        $error = false;
        $ret = "";

        //Get Request
		$this->getRequest();

        header('Content-Type: application/json');

        switch ($this->option) {

			case 'remove':
				$ret = $this->removeNote($this->iduser, $this->key);
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

    protected function getLength($idUser) {
        $sql = "select count(*) as total from postitall where iduser='" . $idUser . "'";
        $resultado = $this->mysqli->query($sql);
		$array = $resultado->fetch_array();
		return intval($array["total"]);
    }

    protected function get($idUser, $idNote) {
        $sql = "select content from postitall where iduser='" . $idUser . "' and idnote='" . $idNote . "'";
        $resultado = $this->mysqli->query($sql);
		$array = $resultado->fetch_array();
		return $array["content"];
    }

    protected function add($idUser, $idNote, $content) {
        return $this->save($idUser, $idNote, $content);
    }

    protected function exists($idUser, $idNote) {
        if($this->get($idUser, $idNote)) {
            return true;
        }
        return false;
    }

    protected function key($idUser, $key) {
        if(!$key) $key = "0";
        $sql = "select idnote from postitall where iduser='" . $idUser . "' limit " . $key . ",1";
        if($resultado = $this->mysqli->query($sql)) {
    		$array = $resultado->fetch_array();
    		return $array["idnote"];
        }
        return "";
    }

	public function getData($idUser) {
		$sql = "select content from postitall where iduser = " . $idUser;
		$resultado = $this->mysqli->query($sql);
		$array = $resultado->fetch_array();
		return $array["content"];
	}

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

	private function insertNote($idUser, $idNote, $content) {
		$sql = "insert into postitall (iduser, idnote, content) values ('".$idUser."','".$idNote."','".$content."')";
		return $this->mysqli->query($sql);
	}

	private function updateNote($idUser, $idNote, $content) {
		$sql = "update postitall set content='".$content."' where iduser='".$idUser."' and idNote='".$idNote."'";
		return $this->mysqli->query($sql);
	}

	private function removeNote($idUser, $idNote) {
		$sql = "delete from postitall where iduser='".$idUser."' and idNote='".$idNote."'";
		return $this->mysqli->query($sql);
	}
}

$pia = new PostItAll();
echo $pia->main();

?>
