import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployed = await deploy("RWAPokemonCards", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log(`RWAPokemonCards contract: `, deployed.address);
};
export default func;
func.id = "deploy_rwapokemoncards";
func.tags = ["RWAPokemonCards"];